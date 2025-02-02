import { CreateLeagueForm } from "@/components/create-league-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export default function CreateLeaguePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              <CardTitle>Create a League</CardTitle>
            </div>
            <CardDescription>
              Set up a new fantasy league for NPFL or EPL. You'll be able to invite other managers once the league is created.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateLeagueForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 