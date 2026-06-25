import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });

          response = NextResponse.next({
            request,
          });

          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });

          response = NextResponse.next({
            request,
          });

          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
  ];

  const isPublicRoute = publicRoutes.includes(pathname);

  // -------------------------
  // NOT LOGGED IN
  // -------------------------

  if (!user) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    return response;
  }

  // -------------------------
  // FETCH ROLE
  // -------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  // -------------------------
  // LOGIN PAGE REDIRECTS
  // -------------------------

  if (
   pathname === "/login" ||
    pathname === "/register" || pathname==="/"
  ) {
    if (role === "admin") { 
      return NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
    }

 /*    return NextResponse.redirect(
      new URL("/", request.url)
    ); */
  }

  // -------------------------
  // ADMIN PROTECTION
  // -------------------------

  if (
    pathname.startsWith("/admin") &&
    role !== "admin"
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }


  return response;
}