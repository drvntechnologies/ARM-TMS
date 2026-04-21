import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import TextFilter from '@cloudscape-design/components/text-filter';
import Pagination from '@cloudscape-design/components/pagination';
import CollectionPreferences from '@cloudscape-design/components/collection-preferences';

interface Order {
  id: string;
  quote_id: string;
  customer_id: string;
  status: string;
  total_amount: number;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string;
  created_at: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Order[]>([]);
  const [filteringText, setFilteringText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    filteringText === '' ||
    order.id.toLowerCase().includes(filteringText.toLowerCase()) ||
    order.status.toLowerCase().includes(filteringText.toLowerCase()) ||
    order.origin.toLowerCase().includes(filteringText.toLowerCase()) ||
    order.destination.toLowerCase().includes(filteringText.toLowerCase())
  );

  const paginatedOrders = filteredOrders.slice(
    (currentPageIndex - 1) * pageSize,
    currentPageIndex * pageSize
  );

  const columnDefinitions = [
    {
      id: 'id',
      header: 'Order ID',
      cell: (item: Order) => item.id.substring(0, 8),
      sortingField: 'id',
      isRowHeader: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: Order) => (
        <Box
          color={
            item.status === 'completed'
              ? 'text-status-success'
              : item.status === 'in_transit'
              ? 'text-status-info'
              : item.status === 'cancelled'
              ? 'text-status-error'
              : 'text-status-inactive'
          }
        >
          {item.status.replace('_', ' ').toUpperCase()}
        </Box>
      ),
      sortingField: 'status',
    },
    {
      id: 'route',
      header: 'Route',
      cell: (item: Order) => `${item.origin} → ${item.destination}`,
    },
    {
      id: 'pickup_date',
      header: 'Pickup Date',
      cell: (item: Order) => new Date(item.pickup_date).toLocaleDateString(),
      sortingField: 'pickup_date',
    },
    {
      id: 'delivery_date',
      header: 'Delivery Date',
      cell: (item: Order) => item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : 'TBD',
      sortingField: 'delivery_date',
    },
    {
      id: 'total_amount',
      header: 'Total Amount',
      cell: (item: Order) => `$${item.total_amount.toLocaleString()}`,
      sortingField: 'total_amount',
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: (item: Order) => new Date(item.created_at).toLocaleDateString(),
      sortingField: 'created_at',
    },
  ];

  return (
    <SpaceBetween size="l">
      <Header
        variant="h1"
        description="Manage and track customer orders"
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={loadOrders} iconName="refresh">
              Refresh
            </Button>
            <Button variant="primary" onClick={() => navigate('/dashboard/orders/new')}>Create Order</Button>
          </SpaceBetween>
        }
      >
        Orders
      </Header>

      <Table
        columnDefinitions={columnDefinitions}
        items={paginatedOrders}
        loading={loading}
        loadingText="Loading orders"
        selectionType="multi"
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        empty={
          <Box textAlign="center" color="inherit">
            <b>No orders</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No orders to display.
            </Box>
            <Button onClick={() => navigate('/dashboard/orders/new')}>Create Order</Button>
          </Box>
        }
        filter={
          <TextFilter
            filteringText={filteringText}
            filteringPlaceholder="Search orders"
            filteringAriaLabel="Filter orders"
            onChange={({ detail }) => setFilteringText(detail.filteringText)}
          />
        }
        header={
          <Header
            counter={`(${filteredOrders.length})`}
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button disabled={selectedItems.length === 0}>
                  View Details
                </Button>
                <Button disabled={selectedItems.length === 0}>
                  Update Status
                </Button>
              </SpaceBetween>
            }
          >
            Orders
          </Header>
        }
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
            pagesCount={Math.ceil(filteredOrders.length / pageSize)}
          />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize: pageSize,
            }}
            pageSizePreference={{
              title: 'Page size',
              options: [
                { value: 10, label: '10 orders' },
                { value: 25, label: '25 orders' },
                { value: 50, label: '50 orders' },
              ],
            }}
            onConfirm={({ detail }) => {
              setPageSize(detail.pageSize || 10);
              setCurrentPageIndex(1);
            }}
          />
        }
      />
    </SpaceBetween>
  );
}
