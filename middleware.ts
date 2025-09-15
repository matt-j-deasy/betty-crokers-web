export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/dashboard/:path*", "/players/:path*", "/teams/:path*", "/matches/:path*"]
};