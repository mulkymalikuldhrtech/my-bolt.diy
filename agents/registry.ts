// Import all built-in agent implementations so their side-effects (auto-registration) run.

// Core AGI Agents - Always loaded first
import './implementations/CommanderAGI';
import './implementations/QualityControlSpecialist';
import './implementations/BackupColonySystem';

// Specialized Agents
import './implementations/VanguardAgent';
import './implementations/SentinelAgent';
import './implementations/PurifierAgent';
import './implementations/JarvisAgent';
import './implementations/WarlordAgent';
import './implementations/MechanicusAgent';
import './implementations/MbakDokterAgent';
import './implementations/DonorSeekerAgent';
import './implementations/FundRaiserAgent';
import './implementations/AutonomatonAgent';
import './implementations/PersonaAgent';
import './implementations/SuperAGIAgent';

// AGI System Initialization
import { agentManager } from './core/AgentManager';

// Initialize AGI ecosystem
export const initializeAGIEcosystem = async () => {
  console.log('🤖 Initializing AGI Ecosystem...');
  
  // Start Commander AGI monitoring
  const commander = agentManager.get('commander-agi');
  if (commander) {
    console.log('✅ Commander AGI initialized and monitoring active');
  }
  
  // Start Quality Control monitoring
  const qualityControl = agentManager.get('quality-control-specialist');
  if (qualityControl) {
    console.log('✅ Quality Control Specialist initialized and monitoring active');
  }
  
  // Log active agents
  const activeAgents = agentManager.list();
  console.log(`🌐 AGI Ecosystem online with ${activeAgents.length} agents:`, 
    activeAgents.map(a => a.name));
  
  return {
    success: true,
    activeAgents: activeAgents.length,
    coreAgents: ['Commander AGI', 'Quality Control Specialist'],
    ecosystem: 'OPERATIONAL'
  };
};