/*
 * Copyright 2020 ZUP IT SERVICOS EM TECNOLOGIA E INOVACAO SA
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect } from 'react';
import Text from 'core/components/Text';
import { allOption } from 'core/components/Form/Select/MultiCheck/constants';
import { useForm } from 'react-hook-form';
import map from 'lodash/map';
import Loader from '../Loaders/index';
import { timestampFormater } from '../helpers';
import { useDeployMetric } from './hooks';
import averageTimeOptions from './averageTime.options';
import deployOptions from './deploy.options';
import { periodFilterItems } from './constants';
import Styled from './styled';
import CircleFilter from './CircleFilter';
import includes from 'lodash/includes';

const Deploys = () => {
  const { searchDeployMetrics, response, loading } = useDeployMetric();
  const { control, handleSubmit, getValues } = useForm();

  const deploySeries = [
    {
      name: 'Deploy',
      data: map(response?.successfulDeploymentsInPeriod, successTotal => ({
        x: successTotal.date,
        y: successTotal.total
      }))
    },
    {
      name: 'Error',
      data: map(response?.failedDeploymentsInPeriod, failedTotal => ({
        x: failedTotal.date,
        y: failedTotal.total
      }))
    }
  ];

  const averageTimeSeries = [
    {
      name: 'Elapse time',
      data: map(
        response?.deploymentsAverageTimeInPeriod,
        DeploymentAverageTime => ({
          x: DeploymentAverageTime.date,
          y: DeploymentAverageTime.averageTime
        })
      )
    }
  ];

  useEffect(() => {
    searchDeployMetrics({ period: periodFilterItems[0].value });
  }, [searchDeployMetrics]);

  const onSubmit = () => {
    const { circles, period } = getValues();
    const filteredCircles = includes(circles, allOption) ? [] : circles;
    console.log(filteredCircles);
    searchDeployMetrics({ period, circles: filteredCircles });
  };

  const renderData = (data: unknown) => {
    if (data === 0) return <Text.h2 color="light"> No data </Text.h2>;
    return <Text.h1 color="light">{data}</Text.h1>;
  };

  return (
    <Styled.Content data-testid="metrics-deploy">
      <Styled.Card width="531px" height="79px">
        <Styled.FilterForm onSubmit={handleSubmit(onSubmit)}>
          <Styled.SingleSelect
            label="Select a timestamp"
            name="period"
            options={periodFilterItems}
            control={control}
            defaultValue={periodFilterItems[0]}
          />
          <CircleFilter control={control} />
          <Styled.Button type="submit" size="EXTRA_SMALL" isLoading={loading}>
            <Text.h5 weight="bold" align="center" color="light">
              Apply
            </Text.h5>
          </Styled.Button>
        </Styled.FilterForm>
      </Styled.Card>

      <Styled.Plates>
        <Styled.Card width="175px" height="94px">
          <Text.h4 color="dark">Deploy</Text.h4>
          <Text.h1 color="light">
            {loading ? (
              <Loader.Card />
            ) : (
              renderData(response?.successfulDeploymentsQuantity)
            )}
          </Text.h1>
        </Styled.Card>
        <Styled.Card width="175px" height="94px">
          <Text.h4 color="dark">Error</Text.h4>
          <Text.h1 color="light">
            {loading ? (
              <Loader.Card />
            ) : (
              renderData(response?.failedDeploymentsQuantity)
            )}
          </Text.h1>
        </Styled.Card>
        <Styled.Card width="175px" height="94px">
          <Text.h4 color="dark">Average time</Text.h4>
          <Text.h1 color="light">
            {loading ? (
              <Loader.Card />
            ) : (
              renderData(
                timestampFormater(
                  response?.successfulDeploymentsAverageTimeInSeconds
                )
              )
            )}
          </Text.h1>
        </Styled.Card>
      </Styled.Plates>
      <Styled.Card width="1220px" height="521px">
        <Text.h2 color="light" weight="bold">
          Deploy
        </Text.h2>
        <Styled.Chart
          options={deployOptions}
          series={deploySeries}
          width={1180}
          height={450}
        />
      </Styled.Card>
      <Styled.Card width="1220px" height="521px">
        <Text.h2 color="light" weight="bold">
          Average time
        </Text.h2>
        <Styled.Chart
          options={averageTimeOptions}
          series={averageTimeSeries}
          width={1180}
          height={450}
        />
      </Styled.Card>
    </Styled.Content>
  );
};

export default Deploys;
