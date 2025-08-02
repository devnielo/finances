'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Eye, EyeOff, Edit, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { CategoryTreeNode } from '@/types';
import { cn } from '@/lib/utils';

interface TreeViewProps {
  data: CategoryTreeNode[];
  onToggleExpansion?: (nodeId: string) => void;
  onNodeClick?: (node: CategoryTreeNode) => void;
  onNodeEdit?: (node: CategoryTreeNode) => void;
  onNodeToggleActive?: (node: CategoryTreeNode) => void;
  className?: string;
  showActions?: boolean;
  maxDepth?: number;
  searchQuery?: string;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  depth: number;
  maxDepth?: number;
  onToggleExpansion?: (nodeId: string) => void;
  onNodeClick?: (node: CategoryTreeNode) => void;
  onNodeEdit?: (node: CategoryTreeNode) => void;
  onNodeToggleActive?: (node: CategoryTreeNode) => void;
  showActions?: boolean;
  searchQuery?: string;
}

function TreeNode({
  node,
  depth,
  maxDepth = 10,
  onToggleExpansion,
  onNodeClick,
  onNodeEdit,
  onNodeToggleActive,
  showActions = true,
  searchQuery,
}: TreeNodeProps) {
  const [showNodeActions, setShowNodeActions] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const canExpand = hasChildren && depth < maxDepth;
  const isExpanded = node.expanded && canExpand;

  // Filter logic for search
  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const hasMatchingChildren = node.children?.some(child => 
    child.name.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    child.description?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  );

  // Don't render if doesn't match search and has no matching children
  if (searchQuery && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canExpand && onToggleExpansion) {
      onToggleExpansion(node.id);
    }
  };

  const handleNodeClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeEdit) {
      onNodeEdit(node);
    }
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNodeToggleActive) {
      onNodeToggleActive(node);
    }
  };

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: depth * 0.05 }}
        className={cn(
          'flex items-center group hover:bg-gray-800/50 rounded-lg transition-colors',
          'cursor-pointer relative',
          depth > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={handleNodeClick}
        onMouseEnter={() => setShowNodeActions(true)}
        onMouseLeave={() => setShowNodeActions(false)}
      >
        {/* Expansion Toggle */}
        <div className="flex items-center">
          {canExpand ? (
            <button
              onClick={handleToggleExpansion}
              className="p-1 hover:bg-gray-700 rounded transition-colors mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 mr-2" /> // Spacer for alignment
          )}

          {/* Node Content */}
          <div className="flex items-center space-x-3 flex-1 py-2 pr-3">
            {/* Color Indicator */}
            {node.color && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: node.color }}
              />
            )}

            {/* Node Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  'font-medium truncate',
                  node.active ? 'text-white' : 'text-gray-400',
                  matchesSearch && searchQuery ? 'bg-yellow-500/20 px-1 rounded' : ''
                )}>
                  {node.name}
                </h3>
                {!node.active && (
                  <span className="text-xs bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
                    Inactiva
                  </span>
                )}
              </div>
              {node.description && (
                <p className={cn(
                  'text-sm truncate mt-0.5',
                  node.active ? 'text-gray-400' : 'text-gray-500',
                  matchesSearch && searchQuery && 
                  node.description.toLowerCase().includes(searchQuery.toLowerCase()) 
                    ? 'bg-yellow-500/20 px-1 rounded' : ''
                )}>
                  {node.description}
                </p>
              )}
            </div>

            {/* Node Actions */}
            {showActions && showNodeActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-1"
              >
                <button
                  onClick={handleToggleActive}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title={node.active ? 'Desactivar' : 'Activar'}
                >
                  {node.active ? (
                    <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
                
                <Link href={`/categories/${node.id}/edit`}>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </Link>

                <Link href={`/categories/${node.id}`}>
                  <button
                    className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-2 border-l border-gray-700/50">
              {node.children.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onToggleExpansion={onToggleExpansion}
                  onNodeClick={onNodeClick}
                  onNodeEdit={onNodeEdit}
                  onNodeToggleActive={onNodeToggleActive}
                  showActions={showActions}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreeView({
  data,
  onToggleExpansion,
  onNodeClick,
  onNodeEdit,
  onNodeToggleActive,
  className,
  showActions = true,
  maxDepth = 10,
  searchQuery,
}: TreeViewProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-400', className)}>
        <p>No hay categorías para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          maxDepth={maxDepth}
          onToggleExpansion={onToggleExpansion}
          onNodeClick={onNodeClick}
          onNodeEdit={onNodeEdit}
          onNodeToggleActive={onNodeToggleActive}
          showActions={showActions}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
}

// Export TreeNode for advanced use cases
export { TreeNode };

// Utility functions for working with tree data
export const TreeUtils = {
  // Find a node by ID in tree structure
  findNode: (data: CategoryTreeNode[], nodeId: string): CategoryTreeNode | null => {
    for (const node of data) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.children) {
        const found = TreeUtils.findNode(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  },

  // Get all expanded node IDs
  getExpandedIds: (data: CategoryTreeNode[]): string[] => {
    const expandedIds: string[] = [];
    
    const traverse = (nodes: CategoryTreeNode[]) => {
      nodes.forEach(node => {
        if (node.expanded) {
          expandedIds.push(node.id);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    
    traverse(data);
    return expandedIds;
  },

  // Toggle expansion state of a node
  toggleExpansion: (data: CategoryTreeNode[], nodeId: string): CategoryTreeNode[] => {
    return data.map(node => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return {
          ...node,
          children: TreeUtils.toggleExpansion(node.children, nodeId)
        };
      }
      return node;
    });
  },

  // Expand all nodes up to a certain depth
  expandToDepth: (data: CategoryTreeNode[], maxDepth: number): CategoryTreeNode[] => {
    const expandNodes = (nodes: CategoryTreeNode[], currentDepth: number): CategoryTreeNode[] => {
      return nodes.map(node => ({
        ...node,
        expanded: currentDepth < maxDepth && node.children && node.children.length > 0,
        children: node.children ? expandNodes(node.children, currentDepth + 1) : []
      }));
    };
    
    return expandNodes(data, 0);
  },

  // Filter tree based on search query
  filterTree: (data: CategoryTreeNode[], searchQuery: string): CategoryTreeNode[] => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    
    const filterNode = (node: CategoryTreeNode): CategoryTreeNode | null => {
      const matches = node.name.toLowerCase().includes(query) ||
                     node.description?.toLowerCase().includes(query);
      
      const filteredChildren = node.children
        ?.map(filterNode)
        .filter(Boolean) as CategoryTreeNode[] || [];
      
      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          expanded: filteredChildren.length > 0 // Auto-expand if has matching children
        };
      }
      
      return null;
    };
    
    return data
      .map(filterNode)
      .filter(Boolean) as CategoryTreeNode[];
  }
};