import { handlers } from "@/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  // GitHub now sends `iss` per RFC 9207. NextAuth beta.30 validates it against
  // an incorrect default issuer ("https://authjs.dev") and rejects the callback.
  // Strip `iss` before the handler processes it so validation passes.
  if (req.nextUrl.searchParams.has("iss")) {
    const url = req.nextUrl.clone()
    url.searchParams.delete("iss")
    return handlers.GET(new NextRequest(url, req))
  }
  return handlers.GET(req)
}

export const { POST } = handlers
