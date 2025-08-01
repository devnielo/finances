import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Tree,
  TreeParent,
  TreeChildren,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('categories')
@Tree('nested-set')
@Index(['name', 'userId'], { unique: true })
export class Category extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ length: 50, nullable: true })
  icon?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    budgetLimit?: number;
    budgetPeriod?: 'monthly' | 'quarterly' | 'yearly';
    alertThreshold?: number;
    tags?: string[];
    keywords?: string[];
  };

  // Foreign Keys
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children: Category[];

  @OneToMany(() => Transaction, (transaction) => transaction.category)
  transactions: Transaction[];

  // Virtual fields
  get fullName(): string {
    if (this.parent) {
      return `${this.parent.fullName} > ${this.name}`;
    }
    return this.name;
  }

  get isRootCategory(): boolean {
    return !this.parentId;
  }

  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  get depth(): number {
    let depth = 0;
    let current = this.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  // Category operations
  canBeDeleted(): boolean {
    // A category can be deleted if it has no transactions and no children
    return !this.hasChildren;
  }

  getAllChildren(): Category[] {
    const allChildren: Category[] = [];
    
    const addChildren = (category: Category) => {
      if (category.children) {
        for (const child of category.children) {
          allChildren.push(child);
          addChildren(child);
        }
      }
    };

    addChildren(this);
    return allChildren;
  }

  getPath(): string[] {
    const path: string[] = [];
    let current: Category | undefined = this;
    
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    
    return path;
  }

  // Budget and spending tracking
  setBudgetLimit(amount: number, period: 'monthly' | 'quarterly' | 'yearly'): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.budgetLimit = amount;
    this.metadata.budgetPeriod = period;
  }

  removeBudgetLimit(): void {
    if (this.metadata) {
      delete this.metadata.budgetLimit;
      delete this.metadata.budgetPeriod;
    }
  }

  setAlertThreshold(percentage: number): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata.alertThreshold = percentage;
  }

  addKeyword(keyword: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.keywords) {
      this.metadata.keywords = [];
    }
    if (!this.metadata.keywords.includes(keyword.toLowerCase())) {
      this.metadata.keywords.push(keyword.toLowerCase());
    }
  }

  removeKeyword(keyword: string): void {
    if (this.metadata?.keywords) {
      this.metadata.keywords = this.metadata.keywords.filter(
        k => k !== keyword.toLowerCase()
      );
    }
  }

  hasKeyword(keyword: string): boolean {
    return this.metadata?.keywords?.includes(keyword.toLowerCase()) || false;
  }

  addTag(tag: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.tags) {
      this.metadata.tags = [];
    }
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    if (this.metadata?.tags) {
      this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
    }
  }

  hasTag(tag: string): boolean {
    return this.metadata?.tags?.includes(tag) || false;
  }

  // Auto-categorization support
  matchesTransaction(description: string, amount?: number): boolean {
    const lowerDescription = description.toLowerCase();
    
    // Check against keywords
    if (this.metadata?.keywords) {
      for (const keyword of this.metadata.keywords) {
        if (lowerDescription.includes(keyword)) {
          return true;
        }
      }
    }

    // Check against category name
    if (lowerDescription.includes(this.name.toLowerCase())) {
      return true;
    }

    return false;
  }

  // Statistics and analytics
  async getTransactionCount(): Promise<number> {
    // This would be implemented in the service layer
    return this.transactions?.length || 0;
  }

  async getTotalSpent(startDate?: Date, endDate?: Date): Promise<number> {
    // This would be implemented in the service layer
    if (!this.transactions) return 0;
    
    let total = 0;
    for (const transaction of this.transactions) {
      if (startDate && transaction.date < startDate) continue;
      if (endDate && transaction.date > endDate) continue;
      total += Math.abs(Number(transaction.amount));
    }
    
    return total;
  }
}