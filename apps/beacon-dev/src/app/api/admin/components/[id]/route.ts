import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch single component
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const component = await prisma.systemComponent.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        module: component.module,
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
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

// PUT: Update component
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const component = await prisma.systemComponent.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        priority: body.priority,
        inputs: body.inputs,
        triggers: body.triggers,
        outputs: body.outputs,
        databaseEffects: body.databaseEffects,
        subcomponents: body.subcomponents,
        notes: body.notes,
        order: body.order,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: component.id,
        module: component.module,
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
    console.error('Error updating component:', error);
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

// DELETE: Delete component
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.systemComponent.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Component deleted',
    });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}
