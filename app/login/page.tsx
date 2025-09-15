import LoginForm from "../components/auth/LoginForm";


export const metadata = { title: "Sign in — Betty Crockers" };

export default function LoginPage() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
