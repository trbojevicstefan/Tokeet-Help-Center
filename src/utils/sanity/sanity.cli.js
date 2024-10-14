import { createClient } from "@sanity/client"
import imageUrlBuilder from '@sanity/image-url';


export const client = createClient({
   projectId: "z9ibsxa0", 
   dataset: "production", 
   apiVersion: "2022-03-07",
   // Set to `true` for production environments
   useCdn: false, 
   token: "skV24TGQ3cPQ3h0n8JxWcYXvA8SDJk1OvzYPbj5Il2Cu2mefFAmv4RTmw6OLKZrZT9IpyELFAyP7nRE2tGLezEmWpwAHSzhMgWPLPaI9iE43l5p27Flj1H5V158SBSL6jD5jXl5Avl9V2BEyPDTJBBPHDJX3CzpPbLYmUy5uN4E3mbjzmWdT"
});

// Image URL builder function
const builder = imageUrlBuilder(client);
export function urlFor(source) {
  return builder.image(source);
}