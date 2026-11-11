import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QuickContactActions } from '../src/components/ui/QuickContactActions';
import { ProjectChecklistPanel } from '../src/features/projects/ProjectChecklistPanel';
import { ProjectFinancialCard } from '../src/features/projects/ProjectFinancialCard';
import { FinancialSummaryCards } from '../src/features/dashboard/FinancialSummaryCards';
import { UrgentProjectsList } from '../src/features/dashboard/UrgentProjectsList';
import { DashboardFiltersBar } from '../src/features/dashboard/DashboardFiltersBar';
import { CashInEntriesPanel } from '../src/features/dashboard/CashInEntriesPanel';
import { getCurrentMonthDateRange } from '../src/utils/format';

describe('Frontend Critical Components (US1-US4 / T051)', () => {
  it('QuickContactActions deve renderizar links wa.me com dígitos sanitizados e mailto:', () => {
    render(
      <QuickContactActions
        whatsapp="(11) 99999-8888"
        email="cliente@empresa.com"
      />,
    );

    const waLink = screen.getByRole('link', { name: /Conversar no WhatsApp/i });
    const mailLink = screen.getByRole('link', { name: /Enviar E-mail/i });

    expect(waLink).toHaveAttribute('href', 'https://wa.me/11999998888');
    expect(mailLink).toHaveAttribute('href', 'mailto:cliente@empresa.com');
  });

  it('ProjectChecklistPanel deve exibir progresso e disparar eventos ao marcar ou adicionar tarefa', () => {
    const onAddTask = vi.fn();
    const onToggleTask = vi.fn();
    const onDeleteTask = vi.fn();

    render(
      <ProjectChecklistPanel
        tasks={[
          {
            id: 't1',
            projectId: 'p1',
            title: 'Briefing Inicial',
            isCompleted: true,
            position: 0,
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 't2',
            projectId: 'p1',
            title: 'Deploy Produção',
            isCompleted: false,
            position: 1,
            createdAt: '',
            updatedAt: '',
          },
        ]}
        progressPercentage={50}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
      />,
    );

    expect(screen.getByText('50% concluído')).toBeInTheDocument();
    expect(screen.getByText('1/2 tarefas')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(onToggleTask).toHaveBeenCalledWith('t2', true);
  });

  it('ProjectFinancialCard deve exibir saldo a receber e bloquear valor pago maior que valor cobrado', () => {
    const onUpdateDirect = vi.fn();
    const onAddPayment = vi.fn();

    render(
      <ProjectFinancialCard
        chargedAmount={5000}
        paidAmount={2000}
        receivableAmount={3000}
        financialStatus="PARTIAL"
        onUpdateDirect={onUpdateDirect}
        onAddPayment={onAddPayment}
      />,
    );

    expect(screen.getByText('Parcialmente Pago')).toBeInTheDocument();

    const paidInput = screen.getByLabelText(/Valor Pago Acumulado/i);
    fireEvent.change(paidInput, { target: { value: '6000' } });
    fireEvent.click(screen.getByRole('button', { name: /Atualizar Valores/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /O valor pago não pode superar o valor cobrado/i,
    );
    expect(onUpdateDirect).not.toHaveBeenCalled();
  });

  it('Dashboard components devem renderizar totais financeiros e projetos urgentes com alerta de atraso', () => {
    render(
      <MemoryRouter>
        <FinancialSummaryCards
          financials={{
            totalCharged: 15000,
            totalPaid: 10000,
            totalReceivable: 5000,
            proposalsTotalValue: 8000,
            entriesInPeriod: 6500,
            entriesCount: 2,
          }}
        />
        <UrgentProjectsList
          items={[
            {
              id: 'p1',
              title: 'E-commerce Urgente',
              clientName: 'Loja X',
              status: 'IN_PROGRESS',
              deadline: '2026-11-08',
              daysRemaining: -3,
              isOverdue: true,
              progressPercentage: 75,
              receivableAmount: 2500,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Entradas no Período')).toBeInTheDocument();
    expect(screen.getByText('E-commerce Urgente')).toBeInTheDocument();
    expect(screen.getByText(/Em Atraso \(3d\)/i)).toBeInTheDocument();
  });

  it('DashboardFiltersBar deve iniciar no mês corrente (01/11 a 30/11) e atualizar datas ao clicar em 7, 15, 21 e 30 dias (ex: 11/11 -> 15d = 27/10 a 11/11)', () => {
    const onChange = vi.fn();
    const onReset = vi.fn();
    const refDate = new Date(2026, 10, 11); // 11/11/2026
    const currentMonth = getCurrentMonthDateRange(refDate);

    expect(currentMonth).toEqual({
      startDate: '2026-11-01',
      endDate: '2026-11-30',
    });

    render(
      <MemoryRouter>
        <DashboardFiltersBar
          filters={{
            periodDays: null,
            startDate: currentMonth.startDate,
            endDate: currentMonth.endDate,
          }}
          referenceDate={refDate}
          clients={[{ id: 'c1', name: 'Cliente Alpha' }]}
          onChange={onChange}
          onReset={onReset}
        />
        <CashInEntriesPanel
          entries={[
            {
              id: 'pay-1',
              projectId: 'p1',
              projectTitle: 'Portal Corporativo',
              clientName: 'Cliente Alpha',
              projectStatus: 'IN_PROGRESS',
              amount: 4500,
              paidAt: '2026-11-10',
              note: 'Entrada 50%',
            },
          ]}
          financials={{
            totalCharged: 9000,
            totalPaid: 4500,
            totalReceivable: 4500,
            proposalsTotalValue: 0,
            entriesInPeriod: 4500,
          }}
          appliedFilter={{
            periodDays: 15,
            startDate: '2026-10-27',
            endDate: '2026-11-11',
            status: null,
            clientId: null,
            urgentDays: 15,
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Data Inicial/i)).toHaveValue('2026-11-01');
    expect(screen.getByLabelText(/Data Final/i)).toHaveValue('2026-11-30');

    // Em 11/11/2026, clicar em "Últimos 15 dias" deve definir 27/10/2026 - 11/11/2026
    fireEvent.click(screen.getByRole('button', { name: /Últimos 15 dias/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        periodDays: 15,
        startDate: '2026-10-27',
        endDate: '2026-11-11',
        urgentDays: 15,
      }),
    );

    // Clicar em "Últimos 7 dias" em 11/11/2026 deve definir 04/11/2026 - 11/11/2026
    fireEvent.click(screen.getByRole('button', { name: /Últimos 7 dias/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        periodDays: 7,
        startDate: '2026-11-04',
        endDate: '2026-11-11',
        urgentDays: 7,
      }),
    );

    // Clicar em "Últimos 21 dias" em 11/11/2026 deve definir 21/10/2026 - 11/11/2026
    fireEvent.click(screen.getByRole('button', { name: /Últimos 21 dias/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        periodDays: 21,
        startDate: '2026-10-21',
        endDate: '2026-11-11',
        urgentDays: 21,
      }),
    );

    // Clicar em "Últimos 30 dias" em 11/11/2026 deve definir 12/10/2026 - 11/11/2026
    fireEvent.click(screen.getByRole('button', { name: /Últimos 30 dias/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        periodDays: 30,
        startDate: '2026-10-12',
        endDate: '2026-11-11',
        urgentDays: 30,
      }),
    );

    expect(screen.getByText('Portal Corporativo')).toBeInTheDocument();
    expect(screen.getByText('Entrada 50%')).toBeInTheDocument();
  });
});
