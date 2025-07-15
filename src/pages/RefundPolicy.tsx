import { Navigation } from "@/components/Navigation";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentStep="refund" showSteps={false} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Refund Eligibility</h2>
            <p>
              We offer refunds for services that do not meet the specified quality standards or technical requirements outlined at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Refund Timeline</h2>
            <p>
              Refund requests must be submitted within 7 days of the service completion. Requests submitted after this period may not be eligible for a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Refund Process</h2>
            <p>
              To request a refund, please contact our support team with your order details and reason for the refund request. We will review your case and respond within 3-5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Processing Time</h2>
            <p>
              Approved refunds will be credited within 7-10 business days and will be credited back to the original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Exceptions</h2>
            <p>
              Services that have been completed and delivered according to specifications may not be eligible for refunds unless there are technical issues with the deliverables.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;