// ProjectCard — project entry card linking to a route.
// Variants: 'terra' (Rug Rumble) and 'blue' (Biconomy).

import Link from 'next/link'
import IconChevronRight from '../../../components/icons/IconChevronRight'

interface ProjectCardProps {
  variant: 'terra' | 'blue'
  title: string
  body: string
  role: string
  href: string
}

export default function ProjectCard({ variant, title, body, role, href }: ProjectCardProps) {
  return (
    <Link href={href} className={`project-card project-card--${variant}`}>
      {/* Illustration */}
      {variant === 'terra' && (
        <div className="project-card__illus project-card__illus--hov" aria-hidden="true">
          <div className="project-card__diamond" />
        </div>
      )}

      <h3 className="project-card__title">{title}</h3>
      <p className="project-card__body">{body}</p>
      <div className="project-card__divider" />
      <div className="project-card__footer">
        <span className="project-card__role">{role}</span>
        <IconChevronRight size={20} className="project-card__arrow" />
      </div>
    </Link>
  )
}
