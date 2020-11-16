import React, { useState, useEffect } from 'react';
import 'antd/dist/antd.css';
import './main.css';
import api from '../../services/api';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

import {
  Layout,
  PageHeader,
  Space,
  Card,
  Descriptions,
  Collapse,
  Col,
  Statistic,
} from 'antd';

const { Sider, Content } = Layout;

const { Panel } = Collapse;
const assetsMedias = new Map();
const assetsStable = [];
const assetsAlert = [];
const assetsCritical = [];

function Main() {
  const [companies, setCompanies] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    api.get('/companies').then(async (response) => {
      const companies = [];
      const compsList = response.data;

      for (let index = 0; index < compsList.length; index++) {
        const company = await api.get(`/companies/${compsList[index]._id}`);
        if (company !== null || company !== undefined) {
        }
        companies.push(company);
      }
      setCompanies(companies);
    });

    api.get('/assets').then(async (response) => {
      const assets = [];
      const assetsList = response.data;

      for (let index = 0; index < assetsList.length; index++) {
        const asset = assetsList[index];
        if (asset.healthscore >= 80) assetsStable.push(asset);
        else if (asset.healthscore >= 60) assetsAlert.push(asset);
        else assetsCritical.push(asset);
      }
      setAssets(assets);
    });
  }, []);

  const chartOptions = {
    title: {
      text: 'Ativos',
    },
    xAxis: {
      categories: ['Estável', 'Em Alerta ', 'Crítico'],
    },

    series: [
      {
        data: [assetsStable.length, assetsAlert.length, assetsCritical.length],
      },
    ],
  };

  function handleUnitClick() {
    for (let index = 0; index < companies.length; index++) {
      const company = companies[index].data;

      for (let x = 0; x < company.units.length; x++) {
        let soma = 0;
        const unit = company.units[x];
        for (let y = 0; y < unit.data.assetsData.length; y++) {
          let asset = unit.data.assetsData[y];

          soma += asset.healthscore;
        }
        let unitMedia = soma / unit.data.assetsData.length;
        assetsMedias.set(`${unit._id}`, unitMedia);
      }
    }
  }

  return (
    <div>
      <Layout>
        <PageHeader
          className='site-page-header'
          title='TRACTIAN - Empresas Cadastradas'
          style={{ backgroundColor: '#839b97' }}
        />
        <Layout>
          <Content>
            <div className='site-card-wrapper'>
              {companies.map((company) => (
                <Card
                  key={company._id}
                  bordered={true}
                  title={company.data.name}
                  className='cardTitle'
                  headStyle={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    backgroundColor: '#f2dcbb',
                  }}
                  style={{ backgroundColor: '#ececec' }}
                >
                  <Descriptions key={company.data._id}>
                    <Descriptions.Item label='Estado'>
                      {company.data.address.state}
                    </Descriptions.Item>
                    <Descriptions.Item label='Cidade'>
                      {company.data.address.city}
                    </Descriptions.Item>
                    <Descriptions.Item label='Rua'>
                      {company.data.address.streetAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label='CEP'>
                      {company.data.address.postalCode}
                    </Descriptions.Item>
                    <Descriptions.Item label='Contato'>
                      {company.data.phone}
                    </Descriptions.Item>
                  </Descriptions>
                  <Card
                    title='Unidades'
                    id='unitCard'
                    headStyle={{
                      fontWeight: 'bold',
                      fontSize: '20px',
                      backgroundColor: '#f9f7cf',
                    }}
                  >
                    {company.data.units.map((unit) => (
                      <Collapse key={unit._id} ghost>
                        <Panel
                          style={{ fontSize: '20px' }}
                          header={unit.name}
                          key='1'
                          showArrow={false}
                          className='panelTitle'
                          id='assetName'
                          onChange={handleUnitClick(unit._id)}
                        >
                          <>
                            {unit.data.assetsData.map((asset) => (
                              <Collapse key={asset._id} ghost>
                                <Panel
                                  header={asset.name}
                                  className='panelTitle'
                                  style={{
                                    fontSize: '17px',
                                    fontWeight: 'normal',
                                  }}
                                >
                                  <div id='divAssets'>
                                    <p>Descrição: {asset.description}</p>
                                    <p>Modelo: {asset.model.name}</p>
                                    <p>
                                      Descrição do Modelo:{' '}
                                      {asset.model.description}
                                    </p>
                                  </div>
                                  <div>
                                    <p>
                                      Status do Ativo:{' '}
                                      <strong
                                        style={{
                                          color: `${
                                            asset.status === 'available'
                                              ? '#a4b787'
                                              : asset.status === 'maintenance'
                                              ? '#f5a25d'
                                              : '#ce6262'
                                          }`,
                                        }}
                                      >
                                        {asset.status === 'available'
                                          ? 'Disponível'
                                          : asset.status === 'maintenance'
                                          ? 'Em manutenção'
                                          : 'Desativado'}
                                      </strong>
                                    </p>
                                  </div>
                                  <Statistic
                                    title='Nível de Saúde do Ativo'
                                    value={asset.healthscore}
                                    precision={2}
                                    valueStyle={{
                                      color: `${
                                        asset.healthscore >= 50
                                          ? '#3f8600'
                                          : '#cf1322'
                                      }`,
                                      fontSize: '18px',
                                    }}
                                    prefix={
                                      asset.healthscore > 50 ? (
                                        <ArrowUpOutlined />
                                      ) : (
                                        <ArrowDownOutlined />
                                      )
                                    }
                                    suffix=''
                                  />
                                </Panel>
                              </Collapse>
                            ))}
                          </>
                          <br />
                          <Col id='colAssetsMedia'>
                            <Statistic
                              title='Média do Nível de Saúde dos Ativos da Unidade'
                              value={
                                assetsMedias.get(unit._id) ||
                                'Unidade sem ativos'
                              }
                              precision={2}
                              valueStyle={
                                assetsMedias.get(unit._id) > 50
                                  ? { color: '#3f8600' }
                                  : { color: '#cf1322' }
                              }
                              prefix={
                                assetsMedias.get(unit._id) > 50 ? (
                                  <ArrowUpOutlined />
                                ) : (
                                  <ArrowDownOutlined />
                                )
                              }
                            />
                          </Col>
                          <br />
                        </Panel>
                      </Collapse>
                    ))}
                  </Card>
                </Card>
              ))}
            </div>
          </Content>
          <Sider width='35%' height='100%' className='sider'>
            <div
              id='siderDiv'
              className='site-card-wrapper'
              style={{
                position: 'fixed',
              }}
            >
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
          </Sider>
        </Layout>
      </Layout>
    </div>
  );
}

export default Main;
