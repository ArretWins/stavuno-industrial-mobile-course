import { describe, expect, it } from 'vitest';
import {
  isProjectRfiOverdue,
  nextProjectRfiNumber,
  projectRfiReference,
  validateProjectRfiInput,
} from '../src/domain/rfi';
import type { ProjectRfi } from '../src/domain/types';

const base: ProjectRfi = {
  id: 'rfi-1', ownerId: 'owner', projectId: 'project', rfiNumber: 7,
  subject: 'Prestup VZT', question: 'Aký má byť priemer prestupu?',
  recipientName: 'Projektant', dueDate: '2026-08-03', status: 'open',
  syncStatus: 'synced', createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

describe('RFI domain', () => {
  it('validates field boundaries', () => {
    expect(validateProjectRfiInput({
      subject: 'Prestup VZT', question: 'Aký má byť priemer prestupu?',
      recipientName: 'Projektant', dueDate: '2026-08-04',
    }, '2026-08-01')).toBe('ok');
    expect(validateProjectRfiInput({
      subject: 'Prestup VZT', question: 'Aký má byť priemer prestupu?',
      recipientName: 'Projektant', dueDate: '2026-07-31',
    }, '2026-08-01')).toBe('due_date');
  });

  it('formats stable references and allocates the next local number', () => {
    expect(projectRfiReference(7)).toBe('RFI-007');
    expect(nextProjectRfiNumber([base, { ...base, id: 'other', rfiNumber: 9 }], 'project')).toBe(10);
  });

  it('marks only unresolved past-due requests as overdue', () => {
    expect(isProjectRfiOverdue(base, '2026-08-04')).toBe(true);
    expect(isProjectRfiOverdue({ ...base, status: 'answered' }, '2026-08-04')).toBe(false);
  });
});
