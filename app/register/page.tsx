import RegisterForm from "../components/auth/RegisterForm";


export const metadata = { title: "Create account — Betty Crockers" };

export default function RegisterPage() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-3xl font-bold text-center">Create your account</h1>
        <RegisterForm />
      </div>
    </main>
  );
}
