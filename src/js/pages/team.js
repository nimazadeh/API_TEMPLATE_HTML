// =============================================================
// APIForge X — Team management
// Workspace summary + members table (role/status/last-active/joined)
// with inline role change, suspend/remove confirmations, invite
// modal with validation, and a pending-invitations block.
// =============================================================

import { localizedFixture } from '../data/localized.js';
import { boot } from '../main.js';
import { Modal } from '../core/bootstrap.js';
import { createIcons, icons } from '../components/icons.js';
import { afxToast } from '../components/toast.js';
import { t as tr, onLocaleChange } from '../core/i18n.js';
import { ask, initConfirm } from '../components/confirm.js';
import { escapeHtml, relativeTime, formatDate, number } from '../utils/format.js';
import teamDataFa from '../data/mock-team.json';
import teamDataEn from '../data/mock-team.en.json';
import invitationsDataFa from '../data/mock-invitations.json';
import invitationsDataEn from '../data/mock-invitations.en.json';
import faPlans from '../data/mock-plans.json';
import enPlans from '../data/mock-plans.en.json';

const teamData = localizedFixture(teamDataFa, teamDataEn);
const invitationsData = localizedFixture(invitationsDataFa, invitationsDataEn);
const plans = localizedFixture(faPlans, enPlans);

boot();
initConfirm({ modalId: 'confirm-modal', titleId: 'confirm-modal-title', bodyId: 'confirm-modal-body', submitId: 'confirm-modal-submit' });

const WORKSPACE = { name: 'APIForge', slug: 'apiforge', id: 'ws_x7k2mQ9p' };
const members = [...teamData];
const invitations = [...invitationsData];

const ROLE_LABEL = { Owner: 'profile.owner', Admin: 'role.adminOption', Developer: 'team.roleDeveloper', Viewer: 'role.viewerOption' };
const ROLE_ICON = { Owner: 'shield-check', Admin: 'shield-check', Developer: 'code-2', Viewer: 'eye' };
const STATUS_BADGE = {
  active: 'badge-status--success',
  pending: 'badge-status--warning',
  suspended: 'badge-status--error',
};

function activeMembers() {
  return members.filter((m) => m.status === 'active');
}

function renderSummary() {
  const currentPlan = plans.find((p) => p.id === 'scale') || plans[plans.length - 1];
  const used = activeMembers().length;
  document.getElementById('team-plan').textContent = currentPlan.name;
  document.getElementById('team-seats').textContent = tr('ui.seatsUsed', { used: number(used), total: number(currentPlan.members) });
  document.getElementById('team-id').textContent = WORKSPACE.id;
  document.getElementById('team-slug').textContent = WORKSPACE.slug;
}

function roleBadge(role) {
  return `<span class="role-badge badge badge-neutral"><i data-lucide="${ROLE_ICON[role]}"></i> ${tr(ROLE_LABEL[role]) || role}</span>`;
}

function statusBadge(status) {
  const label = tr(status === 'active' ? 'status.activePlain' : status === 'pending' ? 'webhooks.statusPending' : 'team.suspended');
  return `<span class="badge badge-status ${STATUS_BADGE[status]}"><span class="dot"></span>${label}</span>`;
}

function memberRow(m) {
  const isOwner = m.role === 'Owner';
  const roleOptions = ['Admin', 'Developer', 'Viewer']
    .filter((r) => r !== m.role)
    .map((r) => `<button type="button" class="dropdown-item" data-role="${r}"><i data-lucide="${ROLE_ICON[r]}"></i> ${tr('ui.makeRole', { role: tr(ROLE_LABEL[r]) })}</button>`)
    .join('');
  return `
    <tr data-id="${m.id}">
      <td>
        <div class="member">
          <span class="avatar">${escapeHtml(m.initials)}</span>
          <span class="member__meta">
            <span class="member__name">${escapeHtml(m.name)}${isOwner ? ` <span class="text-tertiary caption">${tr('ui.you')}</span>` : ''}</span>
            <span class="member__email ltr-isolate">${escapeHtml(m.email)}</span>
          </span>
        </div>
      </td>
      <td>${roleBadge(m.role)}</td>
      <td>${statusBadge(m.status)}</td>
      <td class="text-secondary tabular-nums">${relativeTime(m.lastActive)}</td>
      <td class="text-secondary">${formatDate(m.joined)}</td>
      <td class="text-end">
        <div class="row-actions dropdown" data-dropdown>
          <button type="button" class="btn btn-icon btn-icon--sm" data-bs-toggle="dropdown" aria-label="${tr('aria.actionsFor', { name: escapeHtml(m.name) })}" aria-expanded="false">
            <i data-lucide="more-horizontal"></i>
          </button>
          <div class="dropdown-menu dropdown-menu-end">
            ${!isOwner ? roleOptions : ''}
            ${!isOwner && m.status === 'active' ? `<button type="button" class="dropdown-item" data-suspend><i data-lucide="ban"></i> ${tr('team.suspend')}</button>` : ''}
            ${m.status === 'suspended' ? `<button type="button" class="dropdown-item" data-activate><i data-lucide="circle-check"></i> ${tr('ui.reactivate')}</button>` : ''}
            ${!isOwner ? `<hr class="dropdown-divider" /><button type="button" class="dropdown-item is-danger" data-remove><i data-lucide="trash-2"></i> ${tr('team.remove')}</button>` : ''}
          </div>
        </div>
      </td>
    </tr>`;
}

function invitationRow(inv) {
  return `
    <tr data-invite="${inv.id}">
      <td>
        <div class="member">
          <span class="avatar avatar--sm"><i data-lucide="mail"></i></span>
          <span class="member__meta">
            <span class="member__name ltr-isolate">${escapeHtml(inv.email)}</span>
            <span class="member__email">${tr('ui.invitedBy', { name: escapeHtml(inv.invitedBy) })}</span>
          </span>
        </div>
      </td>
      <td>${roleBadge(inv.role)}</td>
      <td>${statusBadge('pending')}</td>
      <td class="text-secondary">${tr('ui.sentAt', { time: relativeTime(inv.sentAt) })}</td>
      <td class="text-secondary">${tr('ui.expiresIn', { time: escapeHtml(inv.expiresIn) })}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-ghost" data-resend><i data-lucide="send"></i> ${tr('ui.resend')}</button>
        <button type="button" class="btn btn-icon btn-icon--sm" data-revoke aria-label="${tr('ui.revokeInvitation')}"><i data-lucide="x"></i></button>
      </td>
    </tr>`;
}

function render() {
  document.getElementById('team-list').innerHTML = members.length
    ? members.map(memberRow).join('')
    : `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon"><i data-lucide="users"></i></span><h4 class="empty-title">${tr('ui.noMembers')}</h4><p class="empty-desc mb-0">${tr('ui.firstTeammate')}</p></div></td></tr>`;

  const inv = invitations.filter((i) => !i.revoked);
  const invWrap = document.getElementById('team-invitations');
  invWrap.innerHTML = inv.length
    ? inv.map(invitationRow).join('')
    : `<tr><td colspan="6"><div class="empty-state"><span class="empty-icon"><i data-lucide="mail"></i></span><h4 class="empty-title">${tr('ui.noInvitations')}</h4><p class="empty-desc mb-0">${tr('ui.pendingInvitationHelp')}</p></div></td></tr>`;

  document.getElementById('team-count').textContent = tr('ui.membersCount', { count: number(members.length) });
  renderSummary();
  createIcons({ icons });
}

// --- Invite ---------------------------------------------------------------
function bindInvite() {
  const email = document.getElementById('invite-email');
  const role = document.getElementById('invite-role');
  document.getElementById('invite-submit').addEventListener('click', () => {
    const value = email.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    email.classList.toggle('is-invalid', !valid);
    if (!valid) {
      email.focus();
      return;
    }
    email.classList.remove('is-invalid');
    invitations.unshift({
      id: `inv_${Date.now().toString(36)}`,
      email: value,
      role: role.value,
      invitedBy: 'علی رضایی',
      sentAt: new Date().toISOString(),
      expiresIn: '7 days',
    });
    Modal.getOrCreateInstance(document.getElementById('invite-modal')).hide();
    email.value = '';
    role.value = 'Developer';
    render();
    afxToast({ message: tr('team.inviteSent', { email: value }), type: 'success' });
  });
}

// --- Actions ----------------------------------------------------------------
function bindActions() {
  document.getElementById('team-list').addEventListener('click', async (e) => {
    const actionBtn = e.target.closest('[data-role], [data-suspend], [data-activate], [data-remove]');
    if (!actionBtn) return;
    const row = actionBtn.closest('tr');
    const member = members.find((m) => m.id === row.dataset.id);
    if (!member) return;

    if (actionBtn.dataset.role) {
      member.role = actionBtn.dataset.role;
      render();
      afxToast({ message: tr('team.roleChanged', { name: member.name, role: tr(ROLE_LABEL[actionBtn.dataset.role]) }), type: 'success' });
    } else if (actionBtn.dataset.suspend !== undefined) {
      const ok = await ask({ title: () => (tr('team.suspendTitle')), body: () => (tr('team.suspendBody', { name: member.name })), confirmLabel: () => (tr('team.suspend')), danger: true });
      if (ok) {
        member.status = 'suspended';
        render();
        afxToast({ message: tr('team.suspendedToast', { name: member.name }), type: 'info' });
      }
    } else if (actionBtn.dataset.activate !== undefined) {
      member.status = 'active';
      render();
      afxToast({ message: tr('team.reactivatedToast', { name: member.name }), type: 'success' });
    } else if (actionBtn.dataset.remove !== undefined) {
      const ok = await ask({ title: () => (tr('team.removeTitle')), body: () => (tr('team.removeBody', { name: member.name })), confirmLabel: () => (tr('team.remove')), danger: true });
      if (ok) {
        members.splice(members.indexOf(member), 1);
        render();
        afxToast({ message: tr('ui.removed', { name: member.name }), type: 'info' });
      }
    }
  });

  document.getElementById('team-invitations').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const inv = invitations.find((i) => i.id === row.dataset.invite);
    if (!inv) return;
    if (e.target.closest('[data-resend]')) {
      inv.sentAt = new Date().toISOString();
      render();
      afxToast({ message: tr('ui.inviteResent', { email: inv.email }), type: 'success' });
    } else if (e.target.closest('[data-revoke]')) {
      inv.revoked = true;
      render();
      afxToast({ message: tr('ui.inviteRevoked', { email: inv.email }), type: 'info' });
    }
  });
}

// --- Wiring -------------------------------------------------------------------
renderSummary();
render();
bindInvite();
bindActions();

// Re-render when the locale flips.
onLocaleChange(render);
