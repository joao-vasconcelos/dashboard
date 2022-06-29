import useSWR from 'swr';
import { useRouter } from 'next/router';
import { styled } from '@stitches/react';
import Button from '../../components/Button';
import Table from '../../components/Table';
import PageContainer from '../../components/PageContainer';

export default function CheckingAccounts() {
  //

  const router = useRouter();

  const { data: checkingAccounts } = useSWR('/api/checking_accounts/');

  function formatTableData() {
    // Transform data for table
    if (!checkingAccounts) return;
    // Transform data for table
    const arrayOfData = [];
    checkingAccounts.forEach((ca) => {
      const formated = {
        _id: ca._id,
        title: ca.title,
        client_name: ca.client_name,
        tax_id: ca.tax_country + ca.tax_number,
      };
      arrayOfData.push(formated);
    });
    // Return array
    return arrayOfData;
  }

  function handleRowClick(row) {
    router.push('/checking_accounts/' + row._id);
  }

  return (
    <PageContainer title={'Contas Correntes'}>
      <Table
        columns={[
          { label: 'Título', key: 'title' },
          { label: 'Cliente', key: 'client_name' },
          { label: 'NIF', key: 'tax_id' },
        ]}
        data={formatTableData()}
        onRowClick={handleRowClick}
      />
    </PageContainer>
  );
}
