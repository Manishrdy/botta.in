import Link from 'next/link';
export default function NotFound(){return <div className="container not-found"><p className="section-label">404 / Off the map</p><h1>This path doesn’t<br/>lead anywhere.</h1><p>The page may have moved. The projects are a good place to pick things back up.</p><Link href="/projects/" className="button primary">Explore projects</Link></div>}
