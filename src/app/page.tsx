interface User {
  userId: string;
  fullName: string;
  roles: string[];
}

export default function HomePage({ initialUser }: { initialUser?: User }) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <h1 className="text-3xl font-bold">
        Welcome {initialUser ? initialUser.fullName : "Guest"}!
      </h1>
      <p>Your roles: {initialUser ? initialUser.roles.join(", ") : "none"}</p>
    </div>
  );
}
