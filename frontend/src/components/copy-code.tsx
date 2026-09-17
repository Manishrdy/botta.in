'use client';
import { useRef,useState } from 'react';
import { Copy,Check } from 'lucide-react';
export function CopyCode({children}:{children:React.ReactNode}){const ref=useRef<HTMLPreElement>(null);const [status,setStatus]=useState('Copy');async function copy(){try{await navigator.clipboard.writeText(ref.current?.innerText||'');setStatus('Copied')}catch{setStatus('Select to copy')}}return <div className="code-block"><button className="copy-code" onClick={copy} aria-label="Copy code block">{status==='Copied'?<Check size={12}/>:<Copy size={12}/>}<span role="status">{status}</span></button><pre ref={ref}>{children}</pre></div>}
