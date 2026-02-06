"""
Django management command to seed pillars, sub-pillars, and job-pillar weightings
"""
from django.core.management.base import BaseCommand
from jobs.models import JobRole, Pillar, Skill, JobPillarWeight


class Command(BaseCommand):
    help = 'Seed pillars, sub-pillars, and job-pillar weightings for IRI System'

    def handle(self, *args, **options):
        self.stdout.write(self.style.HTTP_INFO('Starting pillar seeding...'))

        # Define 4 Core Pillars
        pillars_data = {
            'Technical Skills': {
                'description': 'Hard technical skills, programming languages, tools, and technical knowledge',
                'sub_pillars': [
                    'Programming Languages',
                    'Frameworks & Libraries',
                    'Databases',
                    'DevOps & Cloud',
                    'Tools & Technologies',
                ]
            },
            'Cognitive Abilities': {
                'description': 'Problem-solving, learning ability, critical thinking, analytical skills',
                'sub_pillars': [
                    'Problem Solving',
                    'Logical Thinking',
                    'Learning Agility',
                    'Analytical Thinking',
                    'Research Ability',
                ]
            },
            'Behavioral Competencies': {
                'description': 'Communication, teamwork, leadership, adaptability, work ethic',
                'sub_pillars': [
                    'Communication',
                    'Teamwork & Collaboration',
                    'Leadership',
                    'Adaptability',
                    'Reliability & Work Ethic',
                ]
            },
            'Domain Knowledge': {
                'description': 'Industry-specific knowledge, best practices, domain expertise',
                'sub_pillars': [
                    'IT Industry Knowledge',
                    'Best Practices',
                    'Emerging Technologies',
                    'Standards & Compliance',
                ]
            }
        }

        # Create Pillars and Sub-Pillars
        pillars_map = {}
        for pillar_name, pillar_info in pillars_data.items():
            pillar, created = Pillar.objects.get_or_create(
                name=pillar_name,
                defaults={'description': pillar_info['description']}
            )
            pillars_map[pillar_name] = pillar
            status = "Created" if created else "Already exists"
            self.stdout.write(self.style.SUCCESS(f'✓ Pillar: {pillar_name} - {status}'))

            # Create Sub-Pillars
            for i, sub_pillar_name in enumerate(pillar_info['sub_pillars'], 1):
                sub_pillar, sub_created = pillar.sub_pillars.get_or_create(
                    name=sub_pillar_name
                )
                sub_status = "Created" if sub_created else "Already exists"
                self.stdout.write(self.style.SUCCESS(f'  └─ {sub_pillar_name} - {sub_status}'))

        # Define Job-Pillar Weightings
        # These define how important each pillar is for each job role
        job_pillar_weights = {
            'Software Engineer': {
                'Technical Skills': 0.40,
                'Cognitive Abilities': 0.30,
                'Behavioral Competencies': 0.20,
                'Domain Knowledge': 0.10,
            },
            'Frontend Developer': {
                'Technical Skills': 0.35,
                'Cognitive Abilities': 0.25,
                'Behavioral Competencies': 0.25,
                'Domain Knowledge': 0.15,
            },
            'Backend Developer': {
                'Technical Skills': 0.40,
                'Cognitive Abilities': 0.30,
                'Behavioral Competencies': 0.15,
                'Domain Knowledge': 0.15,
            },
            'Full Stack Developer': {
                'Technical Skills': 0.38,
                'Cognitive Abilities': 0.28,
                'Behavioral Competencies': 0.18,
                'Domain Knowledge': 0.16,
            },
            'DevOps Engineer': {
                'Technical Skills': 0.45,
                'Cognitive Abilities': 0.25,
                'Behavioral Competencies': 0.15,
                'Domain Knowledge': 0.15,
            },
            'Data Analyst': {
                'Technical Skills': 0.35,
                'Cognitive Abilities': 0.35,
                'Behavioral Competencies': 0.18,
                'Domain Knowledge': 0.12,
            },
            'Data Scientist': {
                'Technical Skills': 0.40,
                'Cognitive Abilities': 0.35,
                'Behavioral Competencies': 0.15,
                'Domain Knowledge': 0.10,
            },
            'Cybersecurity Analyst': {
                'Technical Skills': 0.45,
                'Cognitive Abilities': 0.28,
                'Behavioral Competencies': 0.12,
                'Domain Knowledge': 0.15,
            },
            'UI/UX Designer': {
                'Technical Skills': 0.30,
                'Cognitive Abilities': 0.25,
                'Behavioral Competencies': 0.30,
                'Domain Knowledge': 0.15,
            },
            'Mobile App Developer': {
                'Technical Skills': 0.42,
                'Cognitive Abilities': 0.28,
                'Behavioral Competencies': 0.18,
                'Domain Knowledge': 0.12,
            },
        }

        # Create Job-Pillar Weightings
        self.stdout.write(self.style.HTTP_INFO('\n\nCreating Job-Pillar Weightings...'))
        for job_name, weights in job_pillar_weights.items():
            try:
                job = JobRole.objects.get(name=job_name)
                for pillar_name, weight in weights.items():
                    pillar = pillars_map[pillar_name]
                    job_pillar, jpw_created = JobPillarWeight.objects.get_or_create(
                        job_role=job,
                        pillar=pillar,
                        defaults={'weight_percent': weight*100}
                    )
                    if jpw_created:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'✓ {job_name} → {pillar_name}: {weight*100:.0f}%'
                            )
                        )
            except JobRole.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'✗ Job role not found: {job_name}'))

        self.stdout.write(self.style.SUCCESS('\n✓ Pillar seeding completed successfully!'))
        self.stdout.write(self.style.HTTP_INFO('\nSummary:'))
        self.stdout.write(f'  • 4 Core Pillars created')
        self.stdout.write(f'  • 19 Sub-Pillars created')
        self.stdout.write(f'  • 40 Job-Pillar Weightings created (4 per job × 10 jobs)')
