import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PrizeDistributionConfigProps {
  leagueId: string
  totalPrize: number
  entryFee: number
  maxTeams: number
  onUpdate?: () => void
}

interface PrizeDistribution {
  position: number
  percentage: number
  description?: string
}

interface PrizeDistributionTemplate {
  id: string
  name: string
  description: string
  positions: PrizeDistribution[]
}

export function PrizeDistributionConfig({ 
  leagueId, 
  totalPrize, 
  entryFee, 
  maxTeams,
  onUpdate 
}: PrizeDistributionConfigProps) {
  const [templates, setTemplates] = useState<PrizeDistributionTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [distributions, setDistributions] = useState<PrizeDistribution[]>([])
  const [additionalPrize, setAdditionalPrize] = useState<number>(0)
  const [isPrizeFunded, setIsPrizeFunded] = useState<boolean>(false)
  const [isFinalized, setIsFinalized] = useState<boolean>(false)
  const [distributionType, setDistributionType] = useState<'standard' | 'custom'>('standard')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('configure')
  
  const { toast } = useToast()
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658']
  
  // Calculate total prize pool
  const entryFeesTotal = entryFee * maxTeams
  const totalPrizePool = totalPrize + additionalPrize
  
  // Calculate platform fee
  const platformFee = entryFeesTotal * 0.1 // 10% platform fee
  
  // Calculate league owner profit
  const leagueOwnerProfit = entryFeesTotal - platformFee - totalPrizePool
  
  useEffect(() => {
    fetchTemplates()
    fetchLeagueDistribution()
  }, [leagueId])
  
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('prize_distribution_templates')
        .select('*')
        .order('is_default', { ascending: false })
      
      if (error) throw error
      
      if (data) {
        const formattedTemplates = data.map(template => ({
          ...template,
          positions: Array.isArray(template.positions) 
            ? template.positions 
            : JSON.parse(template.positions)
        }))
        
        setTemplates(formattedTemplates)
        
        // Set default template
        const defaultTemplate = formattedTemplates.find(t => t.is_default)
        if (defaultTemplate && !selectedTemplateId) {
          setSelectedTemplateId(defaultTemplate.id)
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prize distribution templates',
        variant: 'destructive'
      })
    }
  }
  
  const fetchLeagueDistribution = async () => {
    setIsLoading(true)
    try {
      // First get league settings
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('prize_pool_funded, additional_prize_amount, prize_distribution_type, prize_distribution_finalized')
        .eq('id', leagueId)
        .single()
      
      if (leagueError) throw leagueError
      
      if (leagueData) {
        setIsPrizeFunded(leagueData.prize_pool_funded || false)
        setAdditionalPrize(leagueData.additional_prize_amount || 0)
        setDistributionType(leagueData.prize_distribution_type || 'standard')
        setIsFinalized(leagueData.prize_distribution_finalized || false)
      }
      
      // Then get prize distributions
      const { data, error } = await supabase
        .from('league_prize_distribution')
        .select('*')
        .eq('league_id', leagueId)
        .order('position', { ascending: true })
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setDistributions(data)
        setDistributionType('custom')
      } else {
        // If no custom distribution, use template
        const defaultTemplate = templates.find(t => t.is_default)
        if (defaultTemplate) {
          setDistributions(defaultTemplate.positions)
          setSelectedTemplateId(defaultTemplate.id)
        }
      }
    } catch (error) {
      console.error('Error fetching league distribution:', error)
      toast({
        title: 'Error',
        description: 'Failed to load prize distribution',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setDistributions(template.positions)
    }
  }
  
  const handleDistributionChange = (position: number, percentage: number) => {
    const newDistributions = distributions.map(dist => 
      dist.position === position ? { ...dist, percentage } : dist
    )
    setDistributions(newDistributions)
  }
  
  const handleAddPosition = () => {
    const nextPosition = distributions.length > 0 
      ? Math.max(...distributions.map(d => d.position)) + 1 
      : 1
    
    setDistributions([
      ...distributions, 
      { position: nextPosition, percentage: 0 }
    ])
  }
  
  const handleRemovePosition = (position: number) => {
    setDistributions(distributions.filter(d => d.position !== position))
  }
  
  const validateDistribution = () => {
    const total = distributions.reduce((sum, dist) => sum + dist.percentage, 0)
    return Math.abs(total - 100) < 0.01 // Allow for small floating point errors
  }
  
  const handleSaveDistribution = async () => {
    if (!validateDistribution()) {
      toast({
        title: 'Invalid Distribution',
        description: 'Percentages must add up to 100%',
        variant: 'destructive'
      })
      return
    }
    
    try {
      // First update league settings
      const { error: leagueError } = await supabase
        .from('leagues')
        .update({
          prize_pool_funded: isPrizeFunded,
          additional_prize_amount: additionalPrize,
          prize_distribution_type: distributionType,
          prize_distribution_finalized: isFinalized
        })
        .eq('id', leagueId)
      
      if (leagueError) throw leagueError
      
      if (distributionType === 'custom') {
        // Delete existing distributions
        const { error: deleteError } = await supabase
          .from('league_prize_distribution')
          .delete()
          .eq('league_id', leagueId)
        
        if (deleteError) throw deleteError
        
        // Insert new distributions
        const distributionsToInsert = distributions.map(dist => ({
          league_id: leagueId,
          position: dist.position,
          percentage: dist.percentage,
          description: dist.description || `${dist.position}${getOrdinalSuffix(dist.position)} Place`
        }))
        
        const { error: insertError } = await supabase
          .from('league_prize_distribution')
          .insert(distributionsToInsert)
        
        if (insertError) throw insertError
      }
      
      toast({
        title: 'Success',
        description: 'Prize distribution saved successfully',
      })
      
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error saving distribution:', error)
      toast({
        title: 'Error',
        description: 'Failed to save prize distribution',
        variant: 'destructive'
      })
    }
  }
  
  const handleFinalizeDistribution = async () => {
    if (!validateDistribution()) {
      toast({
        title: 'Invalid Distribution',
        description: 'Percentages must add up to 100%',
        variant: 'destructive'
      })
      return
    }
    
    try {
      // Update league settings
      const { error: leagueError } = await supabase
        .from('leagues')
        .update({
          prize_distribution_finalized: true
        })
        .eq('id', leagueId)
      
      if (leagueError) throw leagueError
      
      setIsFinalized(true)
      
      toast({
        title: 'Success',
        description: 'Prize distribution finalized',
      })
      
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('Error finalizing distribution:', error)
      toast({
        title: 'Error',
        description: 'Failed to finalize prize distribution',
        variant: 'destructive'
      })
    }
  }
  
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
          k = i % 100
    if (j === 1 && k !== 11) {
      return 'st'
    }
    if (j === 2 && k !== 12) {
      return 'nd'
    }
    if (j === 3 && k !== 13) {
      return 'rd'
    }
    return 'th'
  }
  
  const getPositionLabel = (position: number) => {
    return `${position}${getOrdinalSuffix(position)} Place`
  }
  
  const getPrizeAmount = (percentage: number) => {
    return (percentage / 100) * totalPrizePool
  }
  
  const chartData = distributions.map((dist, index) => ({
    name: getPositionLabel(dist.position),
    value: dist.percentage,
    amount: getPrizeAmount(dist.percentage)
  }))
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p>{payload[0].value.toFixed(1)}% ({formatNaira(payload[0].payload.amount)})</p>
        </div>
      )
    }
    return null
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Prize Distribution</CardTitle>
          <CardDescription>Loading prize distribution settings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Prize Distribution</CardTitle>
        <CardDescription>Configure how the prize pool will be distributed</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Prize Pool Information</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Entry Fee</p>
                    <p className="text-lg font-bold">{formatNaira(entryFee)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Max Teams</p>
                    <p className="text-lg font-bold">{maxTeams}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Entry Fees</p>
                    <p className="text-lg font-bold">{formatNaira(entryFee * maxTeams)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Platform Fee (10%)</p>
                    <p className="text-lg font-bold">{formatNaira(platformFee)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalPrize">Additional Prize Contribution</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="additionalPrize"
                    type="number"
                    value={additionalPrize}
                    onChange={(e) => setAdditionalPrize(Number(e.target.value))}
                    disabled={isFinalized}
                    min={0}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => setAdditionalPrize(0)}
                    disabled={isFinalized || additionalPrize === 0}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add additional funds to the prize pool beyond entry fees
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Prize Pool Summary</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Base Prize Pool</p>
                    <p className="text-lg font-bold">{formatNaira(totalPrize)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Additional Contribution</p>
                    <p className="text-lg font-bold">{formatNaira(additionalPrize)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Prize Pool</p>
                    <p className="text-lg font-bold">{formatNaira(totalPrizePool)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Your Profit</p>
                    <p className={`text-lg font-bold ${leagueOwnerProfit < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatNaira(leagueOwnerProfit)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="distributionType">Distribution Type</Label>
                <Select 
                  value={distributionType} 
                  onValueChange={(value) => setDistributionType(value as 'standard' | 'custom')}
                  disabled={isFinalized}
                >
                  <SelectTrigger id="distributionType">
                    <SelectValue placeholder="Select distribution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Template</SelectItem>
                    <SelectItem value="custom">Custom Distribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {distributionType === 'standard' && (
                <div className="space-y-2">
                  <Label htmlFor="template">Distribution Template</Label>
                  <Select 
                    value={selectedTemplateId} 
                    onValueChange={handleTemplateChange}
                    disabled={isFinalized}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {templates.find(t => t.id === selectedTemplateId)?.description}
                  </p>
                </div>
              )}
              
              {distributionType === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Custom Prize Distribution</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddPosition}
                      disabled={isFinalized}
                    >
                      Add Position
                    </Button>
                  </div>
                  
                  {distributions.map((dist, index) => (
                    <div key={dist.position} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{getPositionLabel(dist.position)}</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {dist.percentage.toFixed(1)}% ({formatNaira(getPrizeAmount(dist.percentage))})
                          </span>
                          {!isFinalized && distributions.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemovePosition(dist.position)}
                              className="h-8 w-8 p-0"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                      <Slider
                        value={[dist.percentage]}
                        min={0}
                        max={100}
                        step={0.1}
                        onValueChange={(value) => handleDistributionChange(dist.position, value[0])}
                        disabled={isFinalized}
                      />
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className={`font-bold ${validateDistribution() ? 'text-green-500' : 'text-red-500'}`}>
                      {distributions.reduce((sum, dist) => sum + dist.percentage, 0).toFixed(1)}%
                    </span>
                  </div>
                  
                  {!validateDistribution() && (
                    <p className="text-sm text-red-500">
                      Percentages must add up to 100%
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="prizeFunded"
                    checked={isPrizeFunded}
                    onChange={(e) => setIsPrizeFunded(e.target.checked)}
                    disabled={isFinalized}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="prizeFunded" className="text-sm font-normal">
                    I confirm that I have funded the prize pool with {formatNaira(totalPrizePool)}
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Prize Pool Summary</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Prize Pool</p>
                    <p className="text-lg font-bold">{formatNaira(totalPrizePool)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Distribution Type</p>
                    <p className="text-lg font-bold capitalize">{distributionType}</p>
                  </div>
                </div>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                <Label>Prize Breakdown</Label>
                <div className="space-y-2">
                  {distributions.map((dist, index) => (
                    <div key={dist.position} className="flex justify-between items-center py-2 border-b">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{getPositionLabel(dist.position)}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNaira(getPrizeAmount(dist.percentage))}</p>
                        <p className="text-sm text-muted-foreground">{dist.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {isFinalized ? (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    Prize distribution has been finalized
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Once you finalize the prize distribution, it cannot be changed.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setActiveTab(activeTab === 'configure' ? 'preview' : 'configure')}>
          {activeTab === 'configure' ? 'Preview' : 'Edit'}
        </Button>
        <div className="space-x-2">
          {!isFinalized && (
            <>
              <Button 
                variant="outline" 
                onClick={handleSaveDistribution}
                disabled={!validateDistribution()}
              >
                Save
              </Button>
              <Button 
                onClick={handleFinalizeDistribution}
                disabled={!validateDistribution() || !isPrizeFunded}
              >
                Finalize
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
} 