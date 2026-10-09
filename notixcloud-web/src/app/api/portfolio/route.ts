import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        projects: {
          where: {
            status: 'PUBLISHED',
            deletedAt: null,
          },
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            id: true,
            title: true,
            slug: true,
            shortDescription: true,
            featuredImage: true,
            technologies: true,
            clientName: true,
            clientUrl: true,
            projectUrl: true,
            githubUrl: true,
            isFeatured: true,
            sortOrder: true,
            publishedAt: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const featuredProjects = await prisma.portfolioProject.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: 6,
    });

    return NextResponse.json({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        projects: cat.projects.map((proj) => ({
          id: proj.id,
          title: proj.title,
          slug: proj.slug,
          shortDescription: proj.shortDescription,
          featuredImage: proj.featuredImage,
          technologies: proj.technologies,
          clientName: proj.clientName,
          clientUrl: proj.clientUrl,
          projectUrl: proj.projectUrl,
          githubUrl: proj.githubUrl,
          isFeatured: proj.isFeatured,
          sortOrder: proj.sortOrder,
          publishedAt: proj.publishedAt,
        })),
      })),
      featuredProjects: featuredProjects.map((proj) => ({
        id: proj.id,
        title: proj.title,
        slug: proj.slug,
        shortDescription: proj.shortDescription,
        featuredImage: proj.featuredImage,
        technologies: proj.technologies,
        clientName: proj.clientName,
        clientUrl: proj.clientUrl,
        projectUrl: proj.projectUrl,
        githubUrl: proj.githubUrl,
        isFeatured: proj.isFeatured,
        category: proj.category
          ? {
              id: proj.category.id,
              name: proj.category.name,
              slug: proj.category.slug,
              color: proj.category.color,
            }
          : null,
        publishedAt: proj.publishedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}