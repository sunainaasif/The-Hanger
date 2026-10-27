import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell confirmation-page">
      <p className="eyebrow">A little detour</p>
      <h1>We couldn’t find that piece.</h1>
      <p>The product may have moved on. There are plenty of other favorites.</p>
      <Link className="button button-dark" href="/products">
        Back to the collection
      </Link>
    </main>
  );
}