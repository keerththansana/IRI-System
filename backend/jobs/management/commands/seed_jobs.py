from django.core.management.base import BaseCommand

from jobs.models import JobRole, JobPillarWeight, Pillar


class Command(BaseCommand):
    help = "Seed default pillars, job roles, and weights"

    def handle(self, *args, **options):
        pillars = [
            ("Technical", "Technical depth and engineering skills"),
            ("Cognitive", "Problem-solving and analytical thinking"),
            ("Communication", "Collaboration and communication skills"),
            ("Professionalism", "Delivery, ownership, and reliability"),
        ]

        pillar_map = {}
        for name, desc in pillars:
            pillar, _ = Pillar.objects.update_or_create(
                name=name,
                defaults={"description": desc, "default_weight": 25},
            )
            pillar_map[name] = pillar

        job_weights = {
            "Software Engineer": {"Technical": 45, "Cognitive": 25, "Communication": 15, "Professionalism": 15},
            "Frontend Developer": {"Technical": 45, "Cognitive": 20, "Communication": 20, "Professionalism": 15},
            "Backend Developer": {"Technical": 50, "Cognitive": 25, "Communication": 10, "Professionalism": 15},
            "Full Stack Developer": {"Technical": 45, "Cognitive": 25, "Communication": 15, "Professionalism": 15},
            "DevOps Engineer": {"Technical": 50, "Cognitive": 20, "Communication": 10, "Professionalism": 20},
            "Data Analyst": {"Technical": 35, "Cognitive": 35, "Communication": 15, "Professionalism": 15},
            "Data Scientist": {"Technical": 40, "Cognitive": 35, "Communication": 10, "Professionalism": 15},
            "Cybersecurity Analyst": {"Technical": 45, "Cognitive": 25, "Communication": 10, "Professionalism": 20},
            "UI/UX Designer": {"Technical": 30, "Cognitive": 25, "Communication": 30, "Professionalism": 15},
            "Mobile App Developer": {"Technical": 45, "Cognitive": 25, "Communication": 15, "Professionalism": 15},
        }

        for job_name, weights in job_weights.items():
            job, _ = JobRole.objects.update_or_create(name=job_name)
            for pillar_name, weight in weights.items():
                JobPillarWeight.objects.update_or_create(
                    job_role=job,
                    pillar=pillar_map[pillar_name],
                    defaults={"weight_percent": weight},
                )

        self.stdout.write(self.style.SUCCESS("Seeded pillars, jobs, and weights."))
