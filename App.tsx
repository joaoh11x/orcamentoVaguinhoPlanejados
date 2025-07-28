import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import OrcamentoForm from './src/components/OrcamentoForm';
import OrcamentoView from './src/components/OrcamentoView';
import Historico from './src/components/Historico';
import { initializeDatabase } from './src/database/database';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tipo seguro para os ícones
type IoniconsName = 'home' | 'home-outline' | 'time' | 'time-outline';

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="OrcamentoForm" 
        component={OrcamentoForm} 
        options={{ title: 'Vaguinho Planejados' }} 
      />
      <Stack.Screen 
        name="OrcamentoView" 
        component={OrcamentoView} 
        options={{ title: 'Orçamento' }} 
      />
    </Stack.Navigator>
  );
}

function HistoricoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Historico" 
        component={Historico} 
        options={{ title: 'Histórico' }} 
      />
      <Stack.Screen 
        name="OrcamentoView" 
        component={OrcamentoView} 
        options={{ title: 'Orçamento' }} 
      />
      <Stack.Screen 
        name="OrcamentoForm" 
        component={OrcamentoForm} 
        options={{ title: 'Editar Orçamento' }} 
      />
    </Stack.Navigator>
  );
}

const App = () => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: IoniconsName;

            if (route.name === 'Início') {
              iconName = focused ? 'home' : 'home-outline';
            } else {
              iconName = focused ? 'time' : 'time-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Início" component={HomeStack} />
        <Tab.Screen name="Histórico" component={HistoricoStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;