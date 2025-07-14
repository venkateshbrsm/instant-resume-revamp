import { Navigation } from "@/components/Navigation";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentStep="about" showSteps={false} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">About Us</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
            <p>
              We are dedicated to providing high-quality document processing and conversion services that help individuals and businesses streamline their workflow and enhance productivity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do</h2>
            <p>
              Our platform specializes in advanced document conversion and processing services, utilizing cutting-edge technology to ensure accurate and efficient results for our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Values</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Quality: We maintain the highest standards in all our services</li>
              <li>Security: Your documents and data are protected with enterprise-grade security</li>
              <li>Efficiency: Fast processing times without compromising on quality</li>
              <li>Support: Dedicated customer support to assist you every step of the way</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Technology</h2>
            <p>
              We leverage advanced AI and machine learning technologies to provide accurate document processing and conversion services that meet modern business needs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              Have questions or need support? We're here to help. Visit our Contact page to get in touch with our team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;