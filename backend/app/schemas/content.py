"""Reviewable seed contract, shared by ingestion and the future import service.

Dates retain month precision. Source references and unresolved facts are explicit;
structural validity is deliberately separate from permission to import/publish.
"""

from typing import Annotated, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, model_validator

Text = Annotated[str, Field(min_length=1)]
Month = Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]
Slug = Annotated[str, Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")]
Sources = Annotated[list[Text], Field(min_length=1)]


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Source(Model):
    id: Text
    kind: Literal["resume", "owner_response", "github_file"] = "resume"
    filename: Text
    sha256: Annotated[str, Field(pattern=r"^[a-f0-9]{64}$")]
    pages: Annotated[int, Field(gt=0)] | None = None
    url: HttpUrl | None = None
    git_blob_sha: Annotated[str, Field(pattern=r"^[a-f0-9]{40}$")] | None = None

    @model_validator(mode="after")
    def github_evidence_is_traceable(self) -> Self:
        if self.kind == "github_file" and (self.url is None or self.git_blob_sha is None):
            raise ValueError("GitHub evidence requires a source URL and blob SHA")
        return self


class Claim(Model):
    text: Text
    sources: Sources


class SiteSettings(Model):
    name: Text
    site_url: HttpUrl
    email: Annotated[str, Field(pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    location: Text
    target_tracks: Annotated[list[Text], Field(min_length=1)]
    bio: Claim
    resume_url: HttpUrl | None = None


class SocialLink(Model):
    label: Text
    href: HttpUrl
    sources: Sources


class Experience(Model):
    id: Slug
    company: Text
    role: Text
    employment_type: str | None = None
    location: str | None = None
    start_date: Month
    end_date: Month | None
    current: bool
    date_review_required: bool = False
    bullets: Annotated[list[Claim], Field(min_length=1)]
    skills: list[Text]
    sources: Sources
    order: Annotated[int, Field(ge=0)]

    @model_validator(mode="after")
    def dates_are_consistent(self) -> Self:
        if self.current and (self.end_date is not None or self.date_review_required):
            raise ValueError("A current role cannot have an end date or unresolved end date")
        if not self.current and self.end_date is None and not self.date_review_required:
            raise ValueError("A completed role needs an end month or explicit review flag")
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("End month precedes start month")
        return self


class Education(Model):
    id: Slug
    institution: Text
    qualification: Text
    field: Text
    start_date: Month
    end_date: Month
    sources: Sources

    @model_validator(mode="after")
    def dates_are_ordered(self) -> Self:
        if self.end_date < self.start_date:
            raise ValueError("Education end month precedes start month")
        return self


class Project(Model):
    id: Slug
    title: Text
    category: Literal["web", "ai-ml", "agents", "cli", "data", "open-source"]
    repo_url: HttpUrl
    live_url: HttpUrl | None = None
    contribution_url: HttpUrl | None = None
    bullets: Annotated[list[Claim], Field(min_length=1)]
    tags: list[Text]
    sources: Sources
    featured: bool = False
    status: Literal["draft"] = "draft"
    editorial_status: Literal["pending", "approved"] = "pending"


class Skill(Model):
    name: Text
    group: Text
    sources: Sources


class ReviewIssue(Model):
    id: Slug
    entity: Text
    question: Text
    evidence: Annotated[list[Text], Field(min_length=1)]
    disposition: Literal["pending", "deferred", "resolved"] = "pending"
    resolution: str | None = None

    @model_validator(mode="after")
    def resolution_is_recorded(self) -> Self:
        if self.disposition != "pending" and not self.resolution:
            raise ValueError("Resolved/deferred issues need a recorded decision")
        return self


class ContentSeed(Model):
    schema_version: Literal[1] = 1
    # Owner approval allows import, not publication. Repository additions remain
    # project drafts with their own editorial status until reviewed in admin.
    review_status: Literal["pending", "approved"] = "pending"
    sources: Annotated[list[Source], Field(min_length=1)]
    site_settings: SiteSettings
    social_links: list[SocialLink]
    experience: list[Experience]
    education: list[Education]
    projects: list[Project]
    skills: list[Skill]
    review_issues: list[ReviewIssue]

    @model_validator(mode="after")
    def references_and_entities_are_consistent(self) -> Self:
        for label, items in (
            ("source", self.sources), ("experience", self.experience),
            ("education", self.education), ("project", self.projects),
            ("review issue", self.review_issues),
        ):
            ids = [item.id for item in items]
            if len(ids) != len(set(ids)):
                raise ValueError(f"Duplicate {label} IDs")
        names = [skill.name.casefold() for skill in self.skills]
        if len(names) != len(set(names)):
            raise ValueError("Duplicate skill names")
        orders = [item.order for item in self.experience]
        if len(orders) != len(set(orders)):
            raise ValueError("Duplicate experience ordering")
        repositories = [str(project.repo_url).rstrip("/").removesuffix(".git").casefold()
                        for project in self.projects]
        if len(repositories) != len(set(repositories)):
            raise ValueError("Duplicate project repository URLs")
        source_ids = {source.id for source in self.sources}
        records = [self.site_settings.bio, *self.social_links, *self.experience,
                   *self.education, *self.projects, *self.skills]
        records += [claim for item in [*self.experience, *self.projects] for claim in item.bullets]
        for record in records:
            if not set(record.sources) <= source_ids:
                raise ValueError("Unknown source reference")
        if self.review_status == "approved":
            self.require_import_ready()
        return self

    def require_import_ready(self) -> None:
        """Future import must call this guard; validation alone is not approval."""
        if self.review_status != "approved":
            raise ValueError("Owner approval is required before database import")
        if any(issue.disposition == "pending" for issue in self.review_issues):
            raise ValueError("Unresolved review issues must be resolved or explicitly deferred")
        if any(item.date_review_required for item in self.experience):
            raise ValueError("Unresolved employment dates cannot be imported")
