'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Activity, 
  BarChart2, 
  PieChart,
  Shield,
  Clock,
  AlertCircle,
  Settings
} from "lucide-react"
import Link from "next/link"

// This would be a real chart component in production
const LineChart = () => (
  <div className="h-[200px] w-full rounded-md bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center">
    <Activity className="h-24 w-24 text-green-700 opacity-50" />
    <span className="sr-only">Line Chart Placeholder</span>
  </div>
)

// This would be a real chart component in production
const BarChart = () => (
  <div className="h-[200px] w-full rounded-md bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
    <BarChart2 className="h-24 w-24 text-blue-700 opacity-50" />
    <span className="sr-only">Bar Chart Placeholder</span>
  </div>
)

// This would be a real chart component in production
const DonutChart = () => (
  <div className="h-[200px] w-full rounded-md bg-gradient-to-r from-purple-100 to-purple-200 flex items-center justify-center">
    <PieChart className="h-24 w-24 text-purple-700 opacity-50" />
    <span className="sr-only">Donut Chart Placeholder</span>
  </div>
)

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last updated: Today, 10:30 AM
          </Button>
          <Button variant="default" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+15.2% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+7.5% from last month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦1,234,567</div>
            <div className="flex items-center pt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600">+12.3% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue sources for the current month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>League Distribution</CardTitle>
                <CardDescription>
                  Active leagues by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest actions across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: "John Doe", action: "created a new team", time: "5 minutes ago" },
                    { user: "Sarah Smith", action: "joined Premier League", time: "10 minutes ago" },
                    { user: "Michael Johnson", action: "purchased 500 tokens", time: "25 minutes ago" },
                    { user: "Emma Wilson", action: "updated team lineup", time: "1 hour ago" },
                    { user: "David Brown", action: "created a new league", time: "2 hours ago" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center">
                      <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                      <div className="flex-1 ml-2">
                        <p className="text-sm font-medium leading-none">
                          {activity.user} <span className="text-muted-foreground">{activity.action}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Detailed analytics will be displayed here
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Analytics Module</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Detailed analytics features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports Dashboard</CardTitle>
              <CardDescription>
                Generate and view reports
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Reports Module</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Report generation features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Important system alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">System Maintenance</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled maintenance on Sunday, 10 PM - 2 AM
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="mr-2 h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">New Feature Released</p>
                    <p className="text-xs text-muted-foreground">
                      Team comparison tool is now available
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" className="h-20 flex-col gap-1 justify-center">
          <Users className="h-5 w-5" />
          <span>Manage Users</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-1 justify-center">
          <Trophy className="h-5 w-5" />
          <span>Manage Leagues</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-1 justify-center">
          <Settings className="h-5 w-5" />
          <span>System Settings</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-1 justify-center">
          <BarChart2 className="h-5 w-5" />
          <span>Generate Reports</span>
        </Button>
      </div>
    </div>
  )
}

