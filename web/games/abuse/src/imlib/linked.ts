// imlib/linked.cpp: the original's circular doubly linked list (the order of its nodes decides things,
// e.g. which dirty rectangle is checked first)
export class linked_node {
  m_next: linked_node | null = null;
  m_prev: linked_node | null = null;
  Next(): linked_node | null { return this.m_next; }
  Prev(): linked_node | null { return this.m_prev; }
}

export class linked_list<T extends linked_node = linked_node> {
  private m_first: T | null = null;
  private m_count = 0;

  first(): T | null { return this.m_first; }
  Count(): number { return this.m_count; }

  unlink(p: T): number {
    if (!this.m_count) return 0;
    let q = this.m_first as linked_node;
    while (q !== p) {
      q = q.m_next!;
      if (q === this.m_first) return 0;
    }
    q.m_prev!.m_next = q.m_next;
    q.m_next!.m_prev = q.m_prev;
    if (p === this.m_first) this.m_first = (this.m_first.m_next === this.m_first ? null : p.m_next) as T | null;
    this.m_count--;
    return 1;
  }

  add_end(p: T): void {
    if (this.m_first) p.m_prev = this.m_first.m_prev;
    else this.m_first = p;
    p.m_next = this.m_first;
    if (this.m_first !== p) this.m_first.m_prev!.m_next = p;
    this.m_first.m_prev = p;
    this.m_count++;
  }

  add_front(p: T): void {
    this.add_end(p);
    this.m_first = p;
  }

  /** the nodes in order (Count() of them from first()) */
  *[Symbol.iterator](): IterableIterator<T> {
    let p = this.m_first as linked_node | null;
    for (let i = this.m_count; i > 0 && p; i--) {
      const n = p.m_next;
      yield p as T;
      p = n;
    }
  }

  clear(): void {
    this.m_first = null;
    this.m_count = 0;
  }
}
