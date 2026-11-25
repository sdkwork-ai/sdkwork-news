export interface NewsEntityEvent {
  id: string;
  itemId: string;
  itemTitle: string;
  entityType: 'company' | 'industry' | 'sector' | 'instrument';
  entityKey: string;
  eventType: 'earnings' | 'merger_acquisition' | 'ipo_listing' | 'regulatory' | 'dividend' | 'capital_action' | 'product' | 'management_change';
  eventDate: string;
  materiality: 'high' | 'medium' | 'low';
  confidenceBps?: number | null;
  publishedAt?: string | null;
}
