import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Clock, Zap, Plus } from 'lucide-react';

// Node Types
const TriggerNode = ({ data }: { data: any }) => {
  return (
    <Card className="p-4 min-w-[200px] border-2 border-primary">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="font-medium">Trigger</span>
      </div>
      <div className="text-sm text-muted-foreground">{data.label}</div>
    </Card>
  );
};

const EmailNode = ({ data }: { data: any }) => {
  return (
    <Card className="p-4 min-w-[200px] border-2 border-green-500">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-green-500" />
        <span className="font-medium">Send Email</span>
      </div>
      <div className="text-sm text-muted-foreground">{data.subject || 'Email Subject'}</div>
      <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
    </Card>
  );
};

const DelayNode = ({ data }: { data: any }) => {
  return (
    <Card className="p-4 min-w-[200px] border-2 border-orange-500">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-orange-500" />
        <span className="font-medium">Wait</span>
      </div>
      <div className="text-sm text-muted-foreground">{data.duration || '15 Minutes'}</div>
    </Card>
  );
};

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  email: EmailNode,
  delay: DelayNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 50 },
    data: { label: 'Quiz Completed' },
  },
];

const initialEdges: Edge[] = [];

interface EmailSequenceBuilderProps {
  onSave: (sequence: any) => void;
  onCancel: () => void;
}

export const EmailSequenceBuilder: React.FC<EmailSequenceBuilderProps> = ({ onSave, onCancel }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [sequenceName, setSequenceName] = useState('');
  const [nodeConfig, setNodeConfig] = useState<any>({});

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addEmailNode = () => {
    const newNode: Node = {
      id: `email-${Date.now()}`,
      type: 'email',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 150 },
      data: { subject: 'New Email', description: 'Click to configure' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDelayNode = () => {
    const newNode: Node = {
      id: `delay-${Date.now()}`,
      type: 'delay',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 150 },
      data: { duration: '15 Minutes' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type !== 'trigger') {
      setSelectedNode(node);
      setNodeConfig(node.data);
      setIsConfigDialogOpen(true);
    }
  };

  const saveNodeConfig = () => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, ...nodeConfig } }
            : node
        )
      );
    }
    setIsConfigDialogOpen(false);
    setSelectedNode(null);
  };

  const handleSave = () => {
    const sequence = {
      name: sequenceName,
      nodes,
      edges,
    };
    onSave(sequence);
  };

  return (
    <div className="h-[70vh] w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Sequence Name"
            value={sequenceName}
            onChange={(e) => setSequenceName(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addEmailNode}>
            <Mail className="w-4 h-4 mr-2" />
            Add Email
          </Button>
          <Button variant="outline" onClick={addDelayNode}>
            <Clock className="w-4 h-4 mr-2" />
            Add Delay
          </Button>
          <Button onClick={handleSave} disabled={!sequenceName}>
            Save Sequence
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: '#f8fafc' }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Configure {selectedNode?.type === 'email' ? 'Email' : 'Delay'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedNode?.type === 'email' && (
              <>
                <div>
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={nodeConfig.subject || ''}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, subject: e.target.value })}
                    placeholder="Enter email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={nodeConfig.content || ''}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, content: e.target.value })}
                    placeholder="Enter email content"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={nodeConfig.description || ''}
                    onChange={(e) => setNodeConfig({ ...nodeConfig, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
              </>
            )}
            
            {selectedNode?.type === 'delay' && (
              <>
                <div>
                  <Label htmlFor="duration">Wait Duration</Label>
                  <Select
                    value={nodeConfig.duration || '15 Minutes'}
                    onValueChange={(value) => setNodeConfig({ ...nodeConfig, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5 Minutes">5 Minutes</SelectItem>
                      <SelectItem value="15 Minutes">15 Minutes</SelectItem>
                      <SelectItem value="30 Minutes">30 Minutes</SelectItem>
                      <SelectItem value="1 Hour">1 Hour</SelectItem>
                      <SelectItem value="2 Hours">2 Hours</SelectItem>
                      <SelectItem value="1 Day">1 Day</SelectItem>
                      <SelectItem value="2 Days">2 Days</SelectItem>
                      <SelectItem value="1 Week">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveNodeConfig}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};