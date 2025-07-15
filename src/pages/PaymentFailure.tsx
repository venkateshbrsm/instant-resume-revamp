import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, Home, RotateCcw } from "lucide-react";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const txnid = searchParams.get('txnid');
  const errorMessage = searchParams.get('error_Message') || 'Payment failed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">
                We couldn't process your payment
              </p>
              {txnid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{txnid}</span>
                </div>
              )}
              {errorMessage && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold">What happened?</h3>
            <p className="text-muted-foreground text-sm">
              Your payment could not be processed. This might be due to:
            </p>
            <ul className="text-muted-foreground text-sm text-left list-disc list-inside space-y-1">
              <li>Insufficient balance in your account</li>
              <li>Card verification failed</li>
              <li>Transaction was cancelled</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            If you continue to face issues, please contact our support team.
            No amount has been charged to your account.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}