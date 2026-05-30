import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-outline-variant bg-surface">
      <div className="cc-container py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-sm font-bold text-primary">College Compass</p>
            <p className="mt-4 max-w-md text-sm leading-6 text-on-surface-variant">
              Empowering your educational journey with data-driven insights and
              reliable college guidance.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-on-surface">Quick Links</p>
            <div className="mt-4 space-y-2 text-sm">
              <Link href="/" className="cc-footer-link block">
                Home
              </Link>
              <Link href="/colleges" className="cc-footer-link block">
                Browse Colleges
              </Link>
              <Link href="/saved" className="cc-footer-link block">
                Saved Shortlist
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-on-surface">Legal</p>
            <div className="mt-4 space-y-2 text-sm">
              <span className="cc-footer-link block">Privacy Policy</span>
              <span className="cc-footer-link block">Terms of Service</span>
              <span className="cc-footer-link block">Newsletter</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-outline-variant pt-6 text-xs text-on-surface-variant">
          © 2026 College Compass. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
