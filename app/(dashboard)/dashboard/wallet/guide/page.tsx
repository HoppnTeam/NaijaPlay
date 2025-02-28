import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function WalletGuidePage() {
  return (
    <div className="container mx-auto py-6 sm:py-10 space-y-6 sm:space-y-8 px-4 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Wallet User Guide</h1>
        <p className="text-muted-foreground">
          Learn how to use the betting wallet features to deposit and withdraw funds.
        </p>
      </div>

      <Alert className="text-sm sm:text-base">
        <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          All transactions are processed securely through Paystack. Your payment information is never stored on our servers.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="deposit">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="deposit" className="py-3 px-2 sm:py-2 sm:px-3 text-sm sm:text-base">Depositing Funds</TabsTrigger>
          <TabsTrigger value="withdraw" className="py-3 px-2 sm:py-2 sm:px-3 text-sm sm:text-base">Withdrawing Funds</TabsTrigger>
          <TabsTrigger value="faq" className="py-3 px-2 sm:py-2 sm:px-3 text-sm sm:text-base">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="deposit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">How to Deposit Funds</CardTitle>
              <CardDescription>
                Follow these steps to add money to your betting wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 1: Access Your Wallet</h3>
                <p>Navigate to the Dashboard and locate the Betting Wallet card.</p>
                <div className="rounded-md border p-3 sm:p-4">
                  <p className="text-sm">
                    The wallet card displays your current balance and provides options to deposit, withdraw, or view transaction history.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 2: Initiate a Deposit</h3>
                <p>Click the "Deposit" button on the wallet card.</p>
                <div className="rounded-md border p-3 sm:p-4">
                  <p className="text-sm">
                    This will open a modal where you can select or enter the amount you wish to deposit.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 3: Select or Enter Amount</h3>
                <p>Choose from the preset amounts or enter a custom amount.</p>
                <div className="rounded-md border p-3 sm:p-4">
                  <p className="text-sm">
                    Minimum deposit: ₦500<br />
                    Maximum deposit: ₦500,000
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 4: Complete Payment</h3>
                <p>Click "Proceed to Payment" and follow the Paystack instructions.</p>
                <div className="rounded-md border p-3 sm:p-4">
                  <p className="text-sm">
                    You'll be redirected to Paystack's secure payment page where you can complete the transaction using your preferred payment method (card, bank transfer, USSD, etc.).
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 5: Confirmation</h3>
                <p>After successful payment, you'll be redirected back to our platform.</p>
                <div className="rounded-md border p-3 sm:p-4">
                  <p className="text-sm">
                    Your wallet balance will be updated immediately, and you'll receive a confirmation notification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">How to Withdraw Funds</CardTitle>
              <CardDescription>
                Follow these steps to withdraw money from your betting wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md border p-3 sm:p-4 bg-muted">
                <p className="text-sm font-medium">
                  Withdrawal functionality is coming soon!
                </p>
                <p className="text-sm mt-2">
                  We're currently working on implementing secure withdrawal options. This feature will be available in the near future.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upcoming Withdrawal Process</h3>
                <p>Once available, you'll be able to withdraw funds using the following methods:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Bank transfer to verified Nigerian bank accounts</li>
                  <li>Mobile money transfers</li>
                  <li>Other local payment methods</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about the betting wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How long do deposits take to reflect in my account?</h3>
                <p className="text-sm">
                  Deposits are typically processed instantly once payment is confirmed by Paystack. Your wallet balance should update immediately after a successful transaction.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">What payment methods are accepted?</h3>
                <p className="text-sm">
                  We accept all payment methods supported by Paystack, including:
                </p>
                <ul className="list-disc pl-6 text-sm space-y-2 mt-2">
                  <li>Debit/Credit Cards (Visa, Mastercard, Verve)</li>
                  <li>Bank Transfers</li>
                  <li>USSD</li>
                  <li>Mobile Money</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Is there a fee for deposits?</h3>
                <p className="text-sm">
                  We do not charge any fees for deposits. However, your payment provider might apply their standard transaction fees.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">What should I do if my deposit doesn't show up?</h3>
                <p className="text-sm">
                  If your deposit doesn't reflect in your wallet after a successful payment:
                </p>
                <ol className="list-decimal pl-6 text-sm space-y-2 mt-2">
                  <li>Check your email for a payment confirmation from Paystack</li>
                  <li>Refresh your browser or log out and log back in</li>
                  <li>Check your transaction history in the wallet</li>
                  <li>Contact our support team with your payment reference</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Is my payment information secure?</h3>
                <p className="text-sm">
                  Yes, all payments are processed through Paystack, a PCI-DSS compliant payment processor. We never store your card details or sensitive payment information on our servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 