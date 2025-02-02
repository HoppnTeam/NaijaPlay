import { Check, X } from "lucide-react"
import { getPasswordStrength } from "@/lib/utils/password"

interface Requirement {
  text: string
  isMet: boolean
}

interface PasswordRequirementsProps {
  password: string
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements: Requirement[] = [
    {
      text: "At least 8 characters long",
      isMet: password.length >= 8,
    },
    {
      text: "Contains at least one uppercase letter",
      isMet: /[A-Z]/.test(password),
    },
    {
      text: "Contains at least one lowercase letter",
      isMet: /[a-z]/.test(password),
    },
    {
      text: "Contains at least one number",
      isMet: /\d/.test(password),
    },
    {
      text: "Contains at least one special character",
      isMet: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ]

  const strength = getPasswordStrength(password)
  const getStrengthColor = () => {
    if (strength >= 80) return "bg-green-500"
    if (strength >= 60) return "bg-yellow-500"
    if (strength >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Password Requirements:
        </p>
        <ul className="space-y-1">
          {requirements.map((requirement, index) => (
            <li
              key={index}
              className={`text-sm flex items-center space-x-2 ${
                requirement.isMet ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {requirement.isMet ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{requirement.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {password && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Password Strength:
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor()} transition-all duration-300`}
              style={{ width: `${strength}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {strength}% Strong
          </p>
        </div>
      )}
    </div>
  )
} 