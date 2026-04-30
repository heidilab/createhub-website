import Image from "next/image";
import type { TeamMember } from "@/types";

export default function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="group">
      <div className="aspect-[4/5] relative bg-gradient-to-br from-brand-light/40 to-brand-accent/15 overflow-hidden mb-6">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-6xl text-brand-dark/20">
              {member.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="eyebrow-muted mb-2">{member.title}</div>
      <h3 className="font-serif text-[22px] text-brand-text mb-1">
        {member.name}
      </h3>
      {member.nameEn && member.nameEn !== member.name && (
        <div className="text-[11px] text-brand-softer tracking-[0.15em] uppercase mb-4">
          {member.nameEn}
        </div>
      )}
      {member.bio && (
        <p className="text-[13px] text-brand-muted leading-[1.9] mt-3">
          {member.bio}
        </p>
      )}
    </article>
  );
}
