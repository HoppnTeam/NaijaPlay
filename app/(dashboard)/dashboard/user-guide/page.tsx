'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trophy, Users, Coins, Target, LineChart, Wallet, HelpCircle } from "lucide-react"

export default function UserGuidePage() {
  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">NaijaPlay Fantasy Football User Guide</h1>
        <p className="text-muted-foreground">
          Welcome to NaijaPlay - Nigeria's first fantasy football platform. This guide will help you understand how to play and win.
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="getting-started">
            <HelpCircle className="h-4 w-4 mr-2" />
            Getting Started
          </TabsTrigger>
          <TabsTrigger value="team-management">
            <Users className="h-4 w-4 mr-2" />
            Team Management
          </TabsTrigger>
          <TabsTrigger value="leagues">
            <Trophy className="h-4 w-4 mr-2" />
            Leagues
          </TabsTrigger>
          <TabsTrigger value="betting">
            <Target className="h-4 w-4 mr-2" />
            Betting
          </TabsTrigger>
          <TabsTrigger value="stats">
            <LineChart className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="tokens">
            <Coins className="h-4 w-4 mr-2" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with NaijaPlay</CardTitle>
              <CardDescription>
                Learn the basics of NaijaPlay Fantasy Football
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What is NaijaPlay Fantasy Football?</h3>
                <p>
                  NaijaPlay is Nigeria's first fantasy football platform that allows you to create your dream team, 
                  join leagues, and compete with friends and other football fans across the country. 
                  You can win real prizes based on how your selected players perform in actual matches.
                </p>
                
                <h3 className="text-lg font-semibold">How to Get Started</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Create an account or log in if you already have one</li>
                  <li>Create your fantasy team by selecting players within your budget</li>
                  <li>Join existing leagues or create your own to compete with others</li>
                  <li>Manage your team weekly by making transfers and changing formations</li>
                  <li>Track your performance through the stats section</li>
                </ol>
                
                <h3 className="text-lg font-semibold">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Team Management:</strong> Create and manage your fantasy football team</li>
                  <li><strong>Leagues:</strong> Compete in public or private leagues with friends</li>
                  <li><strong>Betting:</strong> Place bets on player and team performances</li>
                  <li><strong>Stats:</strong> Track detailed statistics for players and teams</li>
                  <li><strong>Tokens:</strong> Earn and use tokens for special features</li>
                  <li><strong>Wallet:</strong> Manage your funds for league entries and betting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team-management">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Learn how to create and manage your fantasy team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Creating Your Team</h3>
                <p>
                  When you first sign up, you'll be prompted to create your fantasy team. You'll have a budget of 
                  ₦200 million to spend on players. Your team must include:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>2 Goalkeepers</li>
                  <li>5 Defenders</li>
                  <li>5 Midfielders</li>
                  <li>3 Forwards</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Managing Your Squad</h3>
                <p>
                  You can make changes to your team throughout the season. Here's how squad management works:
                </p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="transfers">
                    <AccordionTrigger>Transfers</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">You can make transfers to replace players in your squad. Each gameweek, you get:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>1 free transfer per week (unused transfers roll over, maximum 2)</li>
                        <li>Additional transfers cost 4 points each</li>
                        <li>Player prices change based on popularity and performance</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="formations">
                    <AccordionTrigger>Formations</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">You can choose different formations for your starting 11 players:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your formation must include 1 goalkeeper</li>
                        <li>You must have at least 3 defenders</li>
                        <li>You must have at least 2 midfielders</li>
                        <li>You must have at least 1 forward</li>
                        <li>Popular formations include 4-4-2, 4-3-3, 3-5-2, and 3-4-3</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="captain">
                    <AccordionTrigger>Captain Selection</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Selecting a captain is crucial for maximizing points:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your captain earns double points</li>
                        <li>Choose players with favorable fixtures or in good form</li>
                        <li>You can also select a vice-captain who will be your captain if your main captain doesn't play</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="bench">
                    <AccordionTrigger>Bench Management</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Managing your bench is important for when starters don't play:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Arrange your bench in priority order</li>
                        <li>If a starter doesn't play, they'll be automatically substituted with the first eligible bench player</li>
                        <li>Substitutions maintain valid formations</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <h3 className="text-lg font-semibold">Scoring System</h3>
                <p>
                  Players earn points based on their performance in real matches:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">All Players</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Playing up to 60 minutes: 1 point</li>
                      <li>Playing 60+ minutes: 2 points</li>
                      <li>Goal scored: 4-6 points (varies by position)</li>
                      <li>Assist: 3 points</li>
                      <li>Yellow card: -1 point</li>
                      <li>Red card: -3 points</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Goalkeepers & Defenders</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Clean sheet: 4 points</li>
                      <li>Every 3 saves: 1 point (GK only)</li>
                      <li>Penalty save: 5 points (GK only)</li>
                      <li>Every 2 goals conceded: -1 point</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leagues */}
        <TabsContent value="leagues">
          <Card>
            <CardHeader>
              <CardTitle>Leagues</CardTitle>
              <CardDescription>
                Compete with friends and other players in leagues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Types of Leagues</h3>
                <p>
                  NaijaPlay offers different types of leagues to join:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Public Leagues:</strong> Open to everyone. Join the main NaijaPlay league to compete with all users.
                  </li>
                  <li>
                    <strong>Private Leagues:</strong> Create your own league and invite friends with a unique code.
                  </li>
                  <li>
                    <strong>Head-to-Head Leagues:</strong> Compete directly against one opponent each gameweek.
                  </li>
                  <li>
                    <strong>Prize Leagues:</strong> Leagues with entry fees and cash prizes for top performers.
                  </li>
                </ul>
                
                <h3 className="text-lg font-semibold">Creating a League</h3>
                <p>
                  To create your own league:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to the Leagues section</li>
                  <li>Click "Create League"</li>
                  <li>Set a name, description, and league type (NPFL or EPL)</li>
                  <li>Set the maximum number of teams</li>
                  <li>Set an entry fee (optional for prize leagues)</li>
                  <li>Set start and end dates</li>
                  <li>Configure prize distribution (for prize leagues)</li>
                </ol>
                
                <h3 className="text-lg font-semibold">Joining a League</h3>
                <p>
                  To join an existing league:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Go to the Leagues section</li>
                  <li>Browse available public leagues or search for a specific league</li>
                  <li>Click "Join League"</li>
                  <li>For private leagues, enter the league code provided by the league creator</li>
                  <li>Pay the entry fee if required (for prize leagues)</li>
                </ol>
                
                <h3 className="text-lg font-semibold">League Prizes</h3>
                <p>
                  Prize leagues offer real money rewards:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Entry fees contribute to the prize pool</li>
                  <li>Prizes are typically distributed among top performers (e.g., top 3 or top 5)</li>
                  <li>Prize distribution is set by the league creator</li>
                  <li>Winnings are credited to your NaijaPlay wallet</li>
                </ul>
                
                <h3 className="text-lg font-semibold">League Leaderboards</h3>
                <p>
                  Track your performance in leagues through leaderboards:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Overall ranking based on total points</li>
                  <li>Weekly performance rankings</li>
                  <li>Head-to-head records (for H2H leagues)</li>
                  <li>Potential earnings display for prize leagues</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Betting */}
        <TabsContent value="betting">
          <Card>
            <CardHeader>
              <CardTitle>Betting</CardTitle>
              <CardDescription>
                Place bets on player and team performances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Types of Bets</h3>
                <p>
                  NaijaPlay offers unique betting options tied to fantasy football:
                </p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="team-betting">
                    <AccordionTrigger>Head-to-Head Team Betting</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Select two teams to compete against each other</li>
                        <li>Choose the gameweek for the matchup</li>
                        <li>Place your bet on which team will score more fantasy points</li>
                        <li>Minimum bet: ₦500, Maximum bet: ₦50,000</li>
                        <li>If your chosen team scores more points: Win 1.8x your bet</li>
                        <li>If both teams score equal points: Get your bet back</li>
                        <li>If your chosen team scores fewer points: Lose your bet</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="player-betting">
                    <AccordionTrigger>Player Performance Betting</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Select a player from the available list</li>
                        <li>Choose a performance metric (goals, assists, clean sheets)</li>
                        <li>Select the gameweek</li>
                        <li>Predict the player's performance (0-10)</li>
                        <li>Minimum bet: ₦200, Maximum bet: ₦20,000</li>
                        <li>Exact match: Win 3x your bet</li>
                        <li>Within 1 of actual performance: Win 1.5x your bet</li>
                        <li>All other predictions: Lose your bet</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <h3 className="text-lg font-semibold">Betting Rules</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All bets must be placed before the gameweek deadline</li>
                  <li>You must have sufficient funds in your wallet to place bets</li>
                  <li>Bet amounts are subject to minimum and maximum limits</li>
                  <li>Winnings are automatically credited to your wallet after results are confirmed</li>
                  <li>NaijaPlay takes a small commission (5%) on winning bets</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Tracking Your Bets</h3>
                <p>
                  You can track all your active and settled bets in the "My Bets" section:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Active bets show potential winnings and current status</li>
                  <li>Settled bets show results and actual winnings</li>
                  <li>Betting history provides a record of all your past bets</li>
                </ul>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Responsible Gambling:</strong> NaijaPlay promotes responsible gambling. Set limits for yourself and never bet more than you can afford to lose. If you feel you may have a gambling problem, please seek help.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>
                Track detailed statistics for players and teams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Player Statistics</h3>
                <p>
                  Track detailed statistics for all players in the game:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Total points and points per game</li>
                  <li>Goals, assists, and clean sheets</li>
                  <li>Minutes played and appearances</li>
                  <li>Form rating (performance over last 5 games)</li>
                  <li>Price changes and ownership percentage</li>
                  <li>Fixture difficulty rating for upcoming games</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Team Statistics</h3>
                <p>
                  Monitor your team's performance with comprehensive stats:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Total points and weekly points</li>
                  <li>Team value and price changes</li>
                  <li>Overall rank and gameweek rank</li>
                  <li>Points by position (defense, midfield, attack)</li>
                  <li>Captain points and bench points</li>
                  <li>Transfer history and chip usage</li>
                </ul>
                
                <h3 className="text-lg font-semibold">League Statistics</h3>
                <p>
                  Analyze league performance with detailed metrics:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>League standings and point differentials</li>
                  <li>Head-to-head records</li>
                  <li>Highest scoring teams by gameweek</li>
                  <li>Most popular players in your league</li>
                  <li>League average score by gameweek</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Using Stats for Strategy</h3>
                <p>
                  Leverage statistics to improve your fantasy strategy:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Identify in-form players for transfers</li>
                  <li>Spot value players (high points per million)</li>
                  <li>Analyze fixture difficulty for planning transfers</li>
                  <li>Compare your team to the top performers</li>
                  <li>Track ownership trends to stay ahead of price changes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tokens */}
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <CardTitle>Tokens</CardTitle>
              <CardDescription>
                Earn and use tokens to top up your team budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What are NaijaPlay Tokens?</h3>
                <p>
                  NaijaPlay Tokens are special in-game currency that can be used to top up your team's available budget when it runs low. 
                  They provide additional fantasy money to help you sign better players and improve your squad.
                </p>
                
                <h3 className="text-lg font-semibold">Earning Tokens</h3>
                <p>
                  You can earn tokens in several ways:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Daily login rewards (5 tokens per day)</li>
                  <li>Completing weekly challenges (10-50 tokens)</li>
                  <li>Purchasing tokens with real money</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Using Tokens</h3>
                <p>
                  Tokens are primarily used to increase your team's budget:
                </p>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="budget">
                    <AccordionTrigger>Top Up Team Budget</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your default team budget is ₦200,000,000</li>
                        <li>When your budget runs low after player purchases, you can use tokens to add more funds</li>
                        <li>Different token packages provide different amounts of fantasy money:</li>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li><strong>100M Fantasy Money:</strong> Basic package</li>
                          <li><strong>250M Fantasy Money:</strong> Standard package</li>
                          <li><strong>500M Fantasy Money:</strong> Premium package</li>
                          <li><strong>1B Fantasy Money:</strong> Ultimate package</li>
                        </ul>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <h3 className="text-lg font-semibold">Token Economy</h3>
                <p>
                  Understanding the token economy:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tokens do not expire and remain in your account until used</li>
                  <li>Tokens can be purchased in various packages with different values</li>
                  <li>The more tokens you purchase at once, the better value you receive</li>
                  <li>Tokens are separate from your wallet balance (real money)</li>
                  <li>Using tokens strategically can give you an advantage in building a stronger team</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet */}
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>Wallet</CardTitle>
              <CardDescription>
                Manage your funds for league entries and betting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your NaijaPlay Wallet</h3>
                <p>
                  The wallet feature allows you to manage real money for league entries, betting, and withdrawing winnings.
                </p>
                
                <h3 className="text-lg font-semibold">Adding Funds</h3>
                <p>
                  You can add funds to your wallet using several payment methods:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Debit/Credit Card (via Paystack)</li>
                  <li>Bank Transfer</li>
                  <li>USSD Payment</li>
                  <li>Mobile Money</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Minimum deposit: ₦500 | Maximum deposit: ₦500,000
                </p>
                
                <h3 className="text-lg font-semibold">Using Your Wallet</h3>
                <p>
                  Your wallet balance can be used for:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Paying entry fees for prize leagues</li>
                  <li>Placing bets on team and player performances</li>
                  <li>Purchasing token packages</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Withdrawing Funds</h3>
                <p>
                  You can withdraw your winnings and remaining balance:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Withdrawals are processed to your registered bank account</li>
                  <li>Minimum withdrawal: ₦1,000</li>
                  <li>Processing time: 1-3 business days</li>
                  <li>Withdrawal fee: 1.5% (minimum ₦50)</li>
                </ul>
                
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <p>
                  Your wallet keeps a detailed record of all transactions:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deposits and withdrawals</li>
                  <li>League entry payments</li>
                  <li>Betting stakes and winnings</li>
                  <li>Token purchases</li>
                  <li>Prize payouts</li>
                </ul>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Security Note:</strong> Your financial information is securely processed through Paystack, a leading payment processor in Africa. NaijaPlay does not store your card details or banking information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 