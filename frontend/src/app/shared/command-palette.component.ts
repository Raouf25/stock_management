import {
  Component, OnInit, OnDestroy, HostListener,
  ElementRef, ViewChild, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Command {
  label:    string;
  sub?:     string;
  icon:     string;
  route?:   string;
  action?:  () => void;
  group:    string;
  keywords: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="open" class="cp-backdrop" (click)="close()"></div>

    <!-- Dialog -->
    <div *ngIf="open" class="cp-wrap" role="dialog" aria-modal="true" aria-label="Palette de commandes">
      <div class="cp-header">
        <i class="bi bi-search cp-search-icon"></i>
        <input
          #searchInput
          class="cp-input"
          type="text"
          placeholder="Rechercher une page, une action…"
          [(ngModel)]="query"
          (input)="filter()"
          (keydown)="onKey($event)"
          autocomplete="off"
          spellcheck="false">
        <kbd class="cp-esc" (click)="close()">ESC</kbd>
      </div>

      <div class="cp-body" #listContainer>

        <div *ngFor="let group of visibleGroups; trackBy: trackGroup">
          <div class="cp-group-label">{{ group }}</div>
          <div
            *ngFor="let cmd of byGroup(group); let i = index; trackBy: trackCmd"
            class="cp-item"
            [class.cp-item-active]="cmd === activeCmd"
            (click)="run(cmd)"
            (mouseenter)="activeCmd = cmd">
            <i class="bi {{ cmd.icon }} cp-item-icon"></i>
            <div class="cp-item-text">
              <span class="cp-item-label">{{ cmd.label }}</span>
              <span *ngIf="cmd.sub" class="cp-item-sub">{{ cmd.sub }}</span>
            </div>
            <i class="bi bi-arrow-return-left cp-item-enter"></i>
          </div>
        </div>

        <div *ngIf="filtered.length === 0" class="cp-empty">
          <i class="bi bi-search cp-empty-icon"></i>
          <span>Aucun résultat pour <strong>« {{ query }} »</strong></span>
        </div>

      </div>

      <div class="cp-footer">
        <span><kbd>↑↓</kbd> naviguer</span>
        <span><kbd>↵</kbd> ouvrir</span>
        <span><kbd>⌘K</kbd> fermer</span>
      </div>
    </div>
  `,
  styles: [`
    /* ── Backdrop ───────────────────────────────────── */
    .cp-backdrop {
      position: fixed; inset: 0;
      background: rgba(15,23,42,0.50);
      backdrop-filter: blur(3px);
      z-index: 9000;
    }

    /* ── Wrap ───────────────────────────────────────── */
    .cp-wrap {
      position: fixed;
      top: 12vh; left: 50%;
      transform: translateX(-50%);
      width: min(640px, calc(100vw - 2rem));
      background: var(--color-surface, #fff);
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
      z-index: 9001;
      overflow: hidden;
      animation: cpIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes cpIn {
      from { opacity: 0; transform: translateX(-50%) scale(0.96) translateY(-8px); }
      to   { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
    }

    /* ── Header ─────────────────────────────────────── */
    .cp-header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .cp-search-icon { font-size: 1rem; color: var(--color-text-muted, #64748b); flex-shrink: 0; }
    .cp-input {
      flex: 1;
      border: none; outline: none;
      font-size: 1rem;
      font-family: var(--font-sans, Inter, sans-serif);
      color: var(--color-text, #0f172a);
      background: transparent;
    }
    .cp-input::placeholder { color: var(--color-text-faint, #94a3b8); }
    .cp-esc {
      padding: 2px 8px;
      background: var(--color-surface-2, #f1f5f9);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 5px;
      font-size: 0.6875rem;
      font-family: inherit;
      color: var(--color-text-muted, #64748b);
      cursor: pointer;
      flex-shrink: 0;
    }

    /* ── Body ───────────────────────────────────────── */
    .cp-body {
      max-height: 380px;
      overflow-y: auto;
      padding: 0.375rem 0;
      scrollbar-width: thin;
    }

    .cp-group-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-faint, #94a3b8);
      padding: 0.5rem 1rem 0.25rem;
    }

    .cp-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      cursor: pointer;
      transition: background 0.1s;
      border-radius: 0;
    }
    .cp-item:hover, .cp-item-active {
      background: var(--color-primary-muted, rgba(99,102,241,0.08));
    }

    .cp-item-icon {
      font-size: 1rem;
      color: var(--color-text-muted, #64748b);
      flex-shrink: 0;
      width: 1.125rem;
      text-align: center;
    }
    .cp-item-active .cp-item-icon { color: var(--color-primary, #6366f1); }

    .cp-item-text { flex: 1; min-width: 0; }
    .cp-item-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text, #0f172a);
    }
    .cp-item-sub {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-muted, #64748b);
      margin-top: 1px;
    }

    .cp-item-enter {
      font-size: 0.75rem;
      color: var(--color-text-faint, #94a3b8);
      flex-shrink: 0;
      opacity: 0;
    }
    .cp-item-active .cp-item-enter { opacity: 1; }

    /* ── Empty ──────────────────────────────────────── */
    .cp-empty {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 1.25rem 1rem;
      font-size: 0.875rem;
      color: var(--color-text-muted, #64748b);
    }
    .cp-empty-icon { font-size: 1rem; opacity: 0.5; }

    /* ── Footer ─────────────────────────────────────── */
    .cp-footer {
      display: flex;
      gap: 1rem;
      padding: 0.5rem 1rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
      font-size: 0.75rem;
      color: var(--color-text-faint, #94a3b8);
    }
    .cp-footer kbd {
      background: var(--color-surface-2, #f1f5f9);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 4px;
      padding: 1px 5px;
      font-family: inherit;
      font-size: 0.6875rem;
    }

    @media (max-width: 640px) {
      .cp-wrap { top: 5vh; }
      .cp-body  { max-height: 55vh; }
    }
  `]
})
export class CommandPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('listContainer') listContainer!: ElementRef<HTMLDivElement>;

  private readonly router = inject(Router);

  open   = false;
  query  = '';
  filtered:  Command[] = [];
  activeCmd: Command | null = null;

  readonly commands: Command[] = [
    // Navigation
    { label: 'Tableau de Bord',     sub: 'Vue d\'ensemble',         icon: 'bi-speedometer2',   route: '/',               group: 'Navigation', keywords: 'dashboard accueil home' },
    { label: 'Produits',            sub: 'Gestion du stock',         icon: 'bi-box-seam',        route: '/products',        group: 'Navigation', keywords: 'produits stock' },
    { label: 'Clients',             sub: 'Annuaire clients',         icon: 'bi-people',          route: '/customers',       group: 'Navigation', keywords: 'clients customers' },
    { label: 'Fournisseurs',        sub: 'Annuaire fournisseurs',    icon: 'bi-building',        route: '/suppliers',       group: 'Navigation', keywords: 'fournisseurs suppliers' },
    { label: 'Transactions',        sub: 'Ventes & Achats',          icon: 'bi-arrow-left-right',route: '/transactions',    group: 'Navigation', keywords: 'ventes achats transactions' },
    { label: 'Factures & BL',       sub: 'Gestion documentaire',    icon: 'bi-receipt',         route: '/invoices/list',   group: 'Navigation', keywords: 'factures bons livraison documents' },
    { label: 'Bons de Livraison',   sub: 'Liste des BL',            icon: 'bi-truck',           route: '/delivery-notes',  group: 'Navigation', keywords: 'bl bons livraison' },
    { label: 'Rapport TVA',         sub: 'Déclaration TVA 19%',     icon: 'bi-percent',         route: '/tax-report',      group: 'Navigation', keywords: 'tva taxe rapport fiscal declaration' },
    { label: 'Mon Profil',          sub: 'Paramètres compte',       icon: 'bi-person-circle',   route: '/profile',         group: 'Navigation', keywords: 'profil compte utilisateur' },

    // Actions
    { label: 'Nouvelle Facture',    sub: 'Créer une facture',       icon: 'bi-file-earmark-plus', route: '/documents/create?mode=facture', group: 'Actions', keywords: 'nouvelle facture créer' },
    { label: 'Nouveau BL',         sub: 'Créer un bon de livraison', icon: 'bi-truck',          route: '/documents/create?mode=bl',      group: 'Actions', keywords: 'nouveau bl créer' },
    { label: 'Nouveau Client',     sub: 'Ajouter un client',        icon: 'bi-person-plus',     route: '/customers/edit/new',            group: 'Actions', keywords: 'nouveau client ajouter' },
    { label: 'Nouveau Fournisseur',sub: 'Ajouter un fournisseur',   icon: 'bi-building-add',    route: '/suppliers/create',              group: 'Actions', keywords: 'nouveau fournisseur ajouter' },
  ];

  ngOnInit(): void { this.filtered = [...this.commands]; }
  ngOnDestroy(): void {}

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const isMac  = navigator.platform.includes('Mac');
    const isCmd  = isMac ? e.metaKey : e.ctrlKey;
    if (isCmd && e.key === 'k') { e.preventDefault(); this.open ? this.close() : this.show(); }
    if (e.key === 'Escape' && this.open) { e.preventDefault(); this.close(); }
  }

  show(): void {
    this.open = true;
    this.query = '';
    this.filtered = [...this.commands];
    setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
  }

  close(): void { this.open = false; this.query = ''; }

  filter(): void {
    const q = this.query.toLowerCase().trim();
    if (!q) { this.filtered = [...this.commands]; this.activeCmd = null; return; }
    this.filtered = this.commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (c.sub ?? '').toLowerCase().includes(q) ||
      c.keywords.includes(q)
    );
    this.activeCmd = this.filtered[0] ?? null;
  }

  onKey(e: KeyboardEvent): void {
    const list = this.filtered;
    if (!list.length) return;
    const idx = this.activeCmd ? list.indexOf(this.activeCmd) : -1;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.activeCmd = list[(idx + 1) % list.length]; this.scrollActive(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); this.activeCmd = list[(idx - 1 + list.length) % list.length]; this.scrollActive(); }
    if (e.key === 'Enter' && this.activeCmd) { e.preventDefault(); this.run(this.activeCmd); }
  }

  run(cmd: Command): void {
    this.close();
    if (cmd.action) { cmd.action(); return; }
    if (cmd.route) {
      const [path, qs] = cmd.route.split('?');
      const qp: Record<string, string> = {};
      if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); qp[k] = v; });
      this.router.navigate([path], Object.keys(qp).length ? { queryParams: qp } : {});
    }
  }

  get visibleGroups(): string[] {
    return [...new Set(this.filtered.map(c => c.group))];
  }
  byGroup(g: string): Command[] { return this.filtered.filter(c => c.group === g); }
  trackGroup(_: number, g: string): string { return g; }
  trackCmd(_: number, c: Command): string  { return c.label; }

  private scrollActive(): void {
    setTimeout(() => {
      const el = this.listContainer?.nativeElement.querySelector('.cp-item-active') as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }, 10);
  }
}
