import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="page-shell about-page">
      <p className="eyebrow">A little about us</p>
      <h1>Good clothes should feel like you.</h1>
      <p>
        The Hanger is about thoughtful pieces that make everyday dressing a
        little easier. We believe the best wardrobe is not the biggest one —
        it is the one you love reaching for, day after day.
      </p>
      <Link className="button button-dark" href="/products">
        Find your favorites
      </Link>
    </main>
  );
}