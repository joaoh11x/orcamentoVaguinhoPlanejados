import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OrcamentoForm from './src/components/OrcamentoForm';
import OrcamentoView from './src/components/OrcamentoView';
import Historico from './src/components/Historico';
import { initializeDatabase } from './src/database/database';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OrcamentoForm">
        <Stack.Screen 
          name="OrcamentoForm" 
          component={OrcamentoForm} 
          options={{ title: 'Novo Orçamento' }} 
        />
        <Stack.Screen 
          name="OrcamentoView" 
          component={OrcamentoView} 
          options={{ title: 'Orçamento' }} 
        />
        <Stack.Screen 
          name="Historico" 
          component={Historico} 
          options={{ title: 'Histórico' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;