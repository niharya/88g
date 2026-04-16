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
          <svg width="27" height="31" viewBox="0 0 29 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.6464 1.26833e-05C14.3548-0.00191177 14.6984 0.21482 14.9981 0.88508C17.5457 6.581 21.8922 11.4428 26.7794 15.2513C28.6599 16.7161 28.3602 17.2699 26.6878 18.6067C22.6455 21.8376 18.7682 25.8285 16.2738 30.4001C15.7725 31.3177 15.0668 33.1459 14.3575 33.7261C14.2925 33.7369 14.2256 33.7464 14.1596 33.7546C13.5832 33.8254 13.3028 33.4115 13.0975 32.9453C10.7872 27.6901 6.99881 23.3985 2.76043 19.6029C2.02455 18.9441 0.107425 17.9394 0.00387143 16.9517C-0.110679 15.8627 2.34988 14.6728 2.99961 13.9281C6.25927 11.0425 9.15786 7.75474 11.4672 4.06244C12.2141 2.86827 12.785 0.974336 13.6464 1.26833e-05Z" fill="var(--orange-560)" />
          </svg>
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
