import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Mixin-style helper: call initFromUrl() in ngOnInit, then bind
 * your filter fields to applyToUrl() calls.
 *
 * Usage:
 *   const urlFilters = inject(UrlFiltersService);
 *   urlFilters.read(route) → Params object
 *   urlFilters.write(router, params) → updates query-params (replaceUrl: true)
 */
@Injectable({ providedIn: 'root' })
export class UrlFiltersService {
  private flush$ = new Subject<Record<string, string | null>>();

  constructor() {
    // debounce rapid successive writes (e.g. every keystroke)
    this.flush$.pipe(
      debounceTime(200),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(params => this._pendingRouter?.navigate([], {
      relativeTo: this._pendingRoute,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl: true
    }));
  }

  private _pendingRouter: Router | null = null;
  private _pendingRoute:  ActivatedRoute | null = null;

  /** Read all queryParams as a plain object */
  read(route: ActivatedRoute): Record<string, string> {
    return { ...route.snapshot.queryParams };
  }

  /** Debounced write to URL */
  write(router: Router, route: ActivatedRoute, params: Record<string, string | null>): void {
    this._pendingRouter = router;
    this._pendingRoute  = route;
    this.flush$.next(params);
  }
}
