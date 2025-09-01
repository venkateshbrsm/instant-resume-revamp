import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Contact Us
              </Link>
              <p className="text-muted-foreground text-sm">
                billing label-hike
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <div className="space-y-1 sm:space-y-2">
              <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms & Conditions
              </Link>
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/refund" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Refund Policy
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <div className="space-y-1 sm:space-y-2">
              <a href="mailto:venkateshbrsm@gmail.com" className="block text-muted-foreground hover:text-foreground transition-colors text-sm break-all">
                Email Support
              </a>
              <a href="tel:+917760111184" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Phone Support
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Follow Us</h3>
            <div className="space-y-1 sm:space-y-2">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                Twitter
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors text-sm">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">&copy; 2024 Document Converter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;