import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Player = {
  id: string
  name: string
  position: string
}

type FormationVisualizationProps = {
  players: Player[]
}

export function FormationVisualization({ players }: FormationVisualizationProps) {
  const formation = {
    Goalkeeper: players.filter(p => p.position === 'Goalkeeper'),
    Defender: players.filter(p => p.position === 'Defender'),
    Midfielder: players.filter(p => p.position === 'Midfielder'),
    Forward: players.filter(p => p.position === 'Forward'),
  }

  const renderPlayers = (position: keyof typeof formation, rows: number) => {
    const positionPlayers = formation[position]
    const playersPerRow = Math.ceil(positionPlayers.length / rows)

    return Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex justify-around my-2">
        {positionPlayers.slice(rowIndex * playersPerRow, (rowIndex + 1) * playersPerRow).map(player => (
          <TooltipProvider key={player.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{player.name}</p>
                <p>{player.position}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    ))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Team Formation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-100 p-4 rounded-lg" style={{ aspectRatio: '2/3' }}>
          <div className="h-full flex flex-col justify-between">
            {renderPlayers('Forward', 1)}
            {renderPlayers('Midfielder', 2)}
            {renderPlayers('Defender', 2)}
            {renderPlayers('Goalkeeper', 1)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

