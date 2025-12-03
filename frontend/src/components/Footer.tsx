import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-white px-6 py-12 text-[color:var(--color-text)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h4 className="mb-2 text-lg font-semibold">SHOPĐÔMINI</h4>
            <p className="text-sm text-[color:var(--color-muted)]">Modern ecommerce demo — curated home goods.</p>
          </div>

          <div>
            <h5 className="mb-2 font-medium">Shop</h5>
            <ul className="text-sm text-[color:var(--color-muted)]">
              <li>
                <Link href="/shop" className="hover:underline">All Products</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline">Cart</Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-2 font-medium">Contact</h5>
            <p className="text-sm text-[color:var(--color-muted)]">support@example.com</p>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-[color:var(--color-muted)]">© {new Date().getFullYear()} SHOPĐÔMINI. All rights reserved.</div>
      </div>
    </footer>
  );
}
