import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all components, optionally filtered by module
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');

    const where = module ? { module } : {};

    const components = await prisma.systemComponent.findMany({
      where,
      orderBy: [
        { module: 'asc' },
        { order: 'asc' },
      ],
    });

    // Group by module for easier frontend consumption
    const grouped: Record<string, any[]> = {};
    components.forEach((comp) => {
      if (!grouped[comp.module]) {
        grouped[comp.module] = [];
      }
      grouped[comp.module].push({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        status: comp.status,
        priority: comp.priority,
        inputs: comp.inputs,
        triggers: comp.triggers,
        outputs: comp.outputs,
        databaseEffects: comp.databaseEffects,
        subcomponents: comp.subcomponents,
        notes: comp.notes,
        createdAt: comp.createdAt.toISOString(),
        updatedAt: comp.updatedAt.toISOString(),
      });
    });

    return NextResponse.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

// POST: Create a new component
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      module,
      name,
      description,
      status,
      priority,
      inputs,
      triggers,
      outputs,
      databaseEffects,
      subcomponents,
      notes,
    } = body;

    if (!module) {
      return NextResponse.json(
        { error: 'Module is required' },
        { status: 400 }
      );
    }

    // Get max order for this module
    const maxOrder = await prisma.systemComponent.aggregate({
      where: { module },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const component = await prisma.systemComponent.create({
      data: {
        module,
        order: nextOrder,
        name: name || '',
        description: description || '',
        status: status || 'planned',
        priority: priority || 'medium',
        inputs: inputs || [],
        triggers: triggers || [],
        outputs: outputs || [],
        databaseEffects: databaseEffects || [],
        subcomponents: subcomponents || [],
        notes: notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        name: component.name,
        description: component.description,
        status: component.status,
        priority: component.priority,
        inputs: component.inputs,
        triggers: component.triggers,
        outputs: component.outputs,
        databaseEffects: component.databaseEffects,
        subcomponents: component.subcomponents,
        notes: component.notes,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json(
      { error: 'Failed to create component' },
      { status: 500 }
    );
  }
}

// PUT: Bulk update - reorder components or save all
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, components } = body;

    if (!module || !Array.isArray(components)) {
      return NextResponse.json(
        { error: 'Module and components array are required' },
        { status: 400 }
      );
    }

    // Delete existing components for this module and recreate
    await prisma.systemComponent.deleteMany({
      where: { module },
    });

    // Create all components with correct order
    const created = await Promise.all(
      components.map((comp: any, index: number) =>
        prisma.systemComponent.create({
          data: {
            id: comp.id, // Preserve IDs if provided
            module,
            order: index,
            name: comp.name || '',
            description: comp.description || '',
            status: comp.status || 'planned',
            priority: comp.priority || 'medium',
            inputs: comp.inputs || [],
            triggers: comp.triggers || [],
            outputs: comp.outputs || [],
            databaseEffects: comp.databaseEffects || [],
            subcomponents: comp.subcomponents || [],
            notes: comp.notes || '',
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: created.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        status: c.status,
        priority: c.priority,
        inputs: c.inputs,
        triggers: c.triggers,
        outputs: c.outputs,
        databaseEffects: c.databaseEffects,
        subcomponents: c.subcomponents,
        notes: c.notes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error updating components:', error);
    return NextResponse.json(
      { error: 'Failed to update components' },
      { status: 500 }
    );
  }
}
