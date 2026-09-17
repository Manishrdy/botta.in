import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function manifest():MetadataRoute.Manifest{return {name:'Manish Botta — Software & AI Engineer',short_name:'Manish Botta',description:'Backend systems, production AI, and the work behind the product.',start_url:'/',display:'standalone',background_color:'#14181c',theme_color:'#14181c',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'}]}}
