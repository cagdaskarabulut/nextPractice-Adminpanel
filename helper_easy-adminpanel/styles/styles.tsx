"use client";

import React, { useEffect, useState } from "react";

// Function to import CSS styles
export const injectStylesheet = () => {
  // Return a promise to track when stylesheet is loaded
  return new Promise<void>((resolve) => {
    // If style is already loaded, don't load it again
    if (document.getElementById("easy-adminpanel-styles")) {
      resolve();
      return;
    }

    // We define CSS code directly here
    const cssContent = `/* Easy AdminPanel Styles */
    /* Loading Screen Styles */
    .easy-adminpanel-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #0D1F36;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.5s ease-out;
    }
    
    .easy-adminpanel-loading.loaded {
      opacity: 0;
      pointer-events: none;
    }
    
    .easy-adminpanel-loading-spinner {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #3378FF;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    
    .easy-adminpanel-loading-text {
      color: white;
      font-size: 1rem;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-top: 1rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Hide content until fully loaded */
    .easy-adminpanel.loading {
      visibility: hidden;
    }
    
    :root {
      --admin-dark-blue-900: #0D1F36;
      --admin-dark-blue-800: #12263F;
      --admin-dark-blue-700: #183054;
      --admin-dark-blue-600: #1D3A6A;
      --admin-dark-blue-500: #2E4780;
      --admin-blue-500: #3378FF;
      --admin-blue-400: #4A8CFF;
      --admin-blue-300: #75AAFF;
      --admin-gray-100: #F7F9FC;
      --admin-gray-200: #EAF0F7;
      --admin-gray-300: #D9E2EC;
      --admin-gray-400: #B3C2D1;
      --admin-gray-500: #8696A7;
      --admin-red-500: #FF3358;
      --admin-red-400: #FF5C7A;
      --admin-green-500: #10B981;
      --admin-green-400: #34D399;
    }
    
    /* Basic Container Styles */
    .admin-container {
      max-width: 95%;
      margin-left: auto;
      margin-right: auto;
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .admin-card {
      background-color: var(--admin-dark-blue-800);
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      padding: 1.5rem;
      border: 1px solid var(--admin-dark-blue-700);
    }
    
    .admin-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 2px 5px rgba(0, 0, 0, 0.12);
    }
    
    /* Sidebar Styles */
    .admin-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100%;
      width: 16rem;
      background-color: var(--admin-dark-blue-800);
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      z-index: 40;
    }
    
    .admin-sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--admin-dark-blue-700);
    }
    
    .admin-sidebar-logo {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }
    
    .admin-sidebar-logo svg {
      margin-right: 0.75rem;
      color: var(--admin-blue-400);
    }
    
    .admin-sidebar-content {
      padding: 1rem;
    }
    
    .admin-sidebar-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: var(--admin-gray-400);
      border-radius: 0.375rem;
      transition: all 0.2s;
      margin-bottom: 0.5rem;
    }
    
    .admin-sidebar-link:hover {
      color: white;
      background-color: var(--admin-dark-blue-700);
    }
    
    .admin-sidebar-link.active {
      color: white;
      background-color: var(--admin-dark-blue-600);
    }
    
    .admin-sidebar-link svg {
      margin-right: 0.75rem;
    }
    
    /* Main Content Styles */
    .admin-main-content {
      margin-left: 16rem;
      padding: 1.5rem;
      min-height: 100vh;
    }
    
    /* Typography Styles */
    .admin-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }
    
    .admin-subtitle {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--admin-gray-200);
    }
    
    /* Button Styles */
    .admin-button-primary {
      background-color: var(--admin-blue-500);
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .admin-button-primary:hover {
      background-color: var(--admin-blue-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    .admin-button-primary svg {
      margin-right: 0.5rem;
    }
    
    .admin-button-secondary {
      background-color: var(--admin-dark-blue-700);
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .admin-button-secondary:hover {
      background-color: var(--admin-dark-blue-600);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    .admin-button-secondary svg {
      margin-right: 0.5rem;
    }
    
    /* Table Styles */
    .admin-table {
      width: 100%;
      text-align: left;
    }
    
    .admin-table th {
      padding: 0.75rem 1rem;
      color: var(--admin-gray-400);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      border-bottom: 1px solid var(--admin-dark-blue-700);
    }
    
    .admin-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--admin-dark-blue-700);
    }
    
    .admin-table tr:hover {
      background-color: var(--admin-dark-blue-700);
    }
    
    /* Action Button Styles for Tables */
    .admin-action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    
    .admin-edit-button {
      background-color: var(--admin-blue-500);
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
    }
    
    .admin-edit-button:hover {
      background-color: var(--admin-blue-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    .admin-delete-button {
      background-color: var(--admin-red-500);
      color: white;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border: none;
      cursor: pointer;
    }
    
    .admin-delete-button:hover {
      background-color: var(--admin-red-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    /* Form Styles */
    .admin-input {
      background-color: var(--admin-dark-blue-700);
      border: 1px solid var(--admin-dark-blue-600);
      color: white;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
    }
    
    .admin-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--admin-blue-500);
    }
    
    .admin-search {
      background-color: var(--admin-dark-blue-700);
      border: 1px solid var(--admin-dark-blue-600);
      color: white;
      border-radius: 0.375rem;
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      width: 100%;
    }
    
    .admin-search:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--admin-blue-500);
    }
    
    /* Toggle Styles */
    .admin-toggle {
      position: relative;
      display: inline-flex;
      height: 1.5rem;
      width: 2.75rem;
      align-items: center;
      border-radius: 9999px;
      background-color: var(--admin-dark-blue-700);
    }
    
    .admin-toggle-active {
      background-color: var(--admin-blue-500);
    }
    
    .admin-toggle-circle {
      display: inline-block;
      height: 1rem;
      width: 1rem;
      transform: translateX(0.25rem);
      border-radius: 9999px;
      background-color: white;
      transition: transform 0.2s;
    }
    
    .admin-toggle-active .admin-toggle-circle {
      transform: translateX(1.25rem);
    }
    
    /* Status Indicator Styles */
    .admin-status-indicator {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    .admin-status-online {
      background-color: rgba(34, 197, 94, 0.2);
      color: rgb(74, 222, 128);
    }
    
    .admin-status-offline {
      background-color: rgba(239, 68, 68, 0.2);
      color: rgb(248, 113, 113);
    }
    
    .admin-status-indicator-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      margin-right: 0.5rem;
    }
    
    .admin-status-online .admin-status-indicator-dot {
      background-color: rgb(34, 197, 94);
    }
    
    .admin-status-offline .admin-status-indicator-dot {
      background-color: rgb(239, 68, 68);
    }
    
    /* Special column styles for record lists */
    .İŞLEMLER, .ISLEMLER, .ACTIONS {
      min-width: 200px;
      text-align: right;
    }
    
    /* New added styles for table action buttons */
    .admin-action-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 0 0.25rem;
      min-width: 80px;
    }
    
    .admin-action-button:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--admin-dark-blue-500);
    }
    
    .admin-edit-action {
      background-color: var(--admin-blue-500);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .admin-edit-action:hover {
      background-color: var(--admin-blue-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    .admin-delete-action {
      background-color: var(--admin-red-500);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .admin-delete-action:hover {
      background-color: var(--admin-red-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    
    /* Hover states for buttons */
    .admin-table button.admin-action-button {
      opacity: 1;
    }
    
    /* Specific styles for Turkish titles */
    .admin-table th.İŞLEMLER, 
    .admin-table th.ISLEMLER, 
    .admin-table th.ACTIONS {
      text-align: right;
    }
    
    /* Scroll Bar Styles */
    .easy-adminpanel ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .easy-adminpanel ::-webkit-scrollbar-track {
      background: var(--admin-dark-blue-800);
    }
    
    .easy-adminpanel ::-webkit-scrollbar-thumb {
      background: var(--admin-dark-blue-500);
      border-radius: 4px;
    }
    
    .easy-adminpanel ::-webkit-scrollbar-thumb:hover {
      background: var(--admin-blue-500);
    }
    
    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-in-out;
    }
    
    /* AdminPanel Component Styles */
    .easy-adminpanel {
      min-height: 100vh;
      background-color: var(--admin-dark-blue-900);
      color: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      display: flex;
    }
    
    .easy-adminpanel-header {
      border-bottom: 1px solid var(--admin-dark-blue-700);
      background-color: var(--admin-dark-blue-800);
      padding: 1.25rem 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 40;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .easy-adminpanel-card {
      background-color: var(--admin-dark-blue-800);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      border: 1px solid var(--admin-dark-blue-700);
      overflow: hidden;
    }
    
    .easy-adminpanel-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3);
      border-color: var(--admin-dark-blue-600);
    }
    
    .easy-adminpanel-card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--admin-dark-blue-700);
    }
    
    .easy-adminpanel-card-title svg {
      margin-right: 0.75rem;
      color: var(--admin-blue-400);
      width: 22px;
      height: 22px;
    }
    
    .easy-adminpanel-card-content {
      margin-bottom: 1rem;
    }
    
    .easy-adminpanel-card-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid var(--admin-dark-blue-700);
    }
    
    .easy-adminpanel-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      font-weight: 500;
      margin-right: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .easy-adminpanel-button svg {
      margin-right: 0.5rem;
      width: 18px;
      height: 18px;
    }
    
    .easy-adminpanel-button-primary {
      background-color: var(--admin-blue-500);
      color: white;
    }
    
    .easy-adminpanel-button-primary:hover {
      background-color: var(--admin-blue-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .easy-adminpanel-button-secondary {
      background-color: var(--admin-dark-blue-700);
      color: white;
    }
    
    .easy-adminpanel-button-secondary:hover {
      background-color: var(--admin-dark-blue-600);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .easy-adminpanel-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
    }
    
    .easy-adminpanel-subtitle {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .easy-adminpanel-content {
      flex: 1;
      padding: 1.5rem;
    }
    
    .easy-adminpanel-sidebar {
      width: 250px;
      background-color: var(--admin-dark-blue-800);
      min-height: 100vh;
      border-right: 1px solid var(--admin-dark-blue-700);
      padding: 0;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }
    
    .easy-adminpanel-sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--admin-dark-blue-700);
      margin-bottom: 0;
      background-color: var(--admin-dark-blue-800);
    }
    
    .easy-adminpanel-sidebar-logo {
      display: flex;
      align-items: center;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }
    
    .easy-adminpanel-sidebar-logo svg {
      margin-right: 0.75rem;
      color: var(--admin-blue-400);
      width: 1.5rem;
      height: 1.5rem;
    }
    
    .easy-adminpanel-sidebar-nav {
      padding: 1rem 0;
      overflow-y: auto;
      flex-grow: 1;
    }
    
    .easy-adminpanel-sidebar-section {
      margin-bottom: 1.5rem;
    }
    
    .easy-adminpanel-sidebar-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--admin-gray-500);
      padding: 0 1.5rem;
      margin-bottom: 0.5rem;
      letter-spacing: 0.05em;
    }
    
    .easy-adminpanel-sidebar-nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: var(--admin-gray-300);
      transition: all 0.2s;
      cursor: pointer;
      margin: 0;
      border-left: 3px solid transparent;
    }
    
    .easy-adminpanel-sidebar-nav-item:hover {
      color: white;
      background-color: var(--admin-dark-blue-700);
      border-left-color: var(--admin-blue-400);
    }
    
    .easy-adminpanel-sidebar-nav-item.active {
      color: white;
      background-color: var(--admin-dark-blue-700);
      border-left-color: var(--admin-blue-500);
    }
    
    .easy-adminpanel-sidebar-nav-item svg {
      margin-right: 0.75rem;
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .easy-adminpanel-main {
      flex: 1;
      min-width: 0;
      padding-top: 4.5rem; /* Add padding to account for fixed header height */
    }
    
    /* Grid System for Cards */
    .easy-adminpanel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .easy-adminpanel-sidebar {
        width: 0;
        overflow: hidden;
      }
      
      .easy-adminpanel-sidebar.open {
        width: 250px;
      }
      
      .easy-adminpanel-main {
        margin-left: 0;
      }
    }
    
    /* Modal Styles for Table Management */
    .admin-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(3, 7, 18, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      animation: fadeIn 0.2s ease-out;
    }
    
    .admin-modal {
      background-color: var(--admin-dark-blue-800);
      border-radius: 0.75rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 32rem;
      max-height: 90vh;
      overflow: hidden;
      border: 1px solid var(--admin-dark-blue-600);
      transform: translateY(0);
      animation: modalSlideIn 0.3s ease-out;
    }
    
    .admin-modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--admin-dark-blue-700);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .admin-modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
    }
    
    .admin-modal-close {
      background-color: transparent;
      border: none;
      color: var(--admin-gray-400);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .admin-modal-close:hover {
      color: white;
      background-color: var(--admin-dark-blue-700);
    }
    
    .admin-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      max-height: 60vh;
    }
    
    .admin-modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--admin-dark-blue-700);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
    
    /* Table selection styles */
    .admin-table-select {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--admin-dark-blue-700);
      transition: all 0.2s;
    }
    
    .admin-table-select:hover {
      background-color: var(--admin-dark-blue-700);
    }
    
    .admin-table-select label {
      display: flex;
      align-items: center;
      width: 100%;
      cursor: pointer;
    }
    
    .admin-table-select-checkbox {
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 0.25rem;
      border: 2px solid var(--admin-gray-400);
      margin-right: 0.75rem;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    
    .admin-table-select input[type="checkbox"] {
      opacity: 0;
      position: absolute;
      height: 1px;
      width: 1px;
    }
    
    .admin-table-select input[type="checkbox"]:checked + .admin-table-select-checkbox {
      background-color: var(--admin-blue-500);
      border-color: var(--admin-blue-500);
    }
    
    .admin-table-select input[type="checkbox"]:checked + .admin-table-select-checkbox::after {
      content: '';
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 0.125rem;
      background-color: white;
    }
    
    .admin-table-select-name {
      font-weight: 500;
      color: white;
    }
    
    .admin-table-select-description {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: var(--admin-gray-400);
    }
    
    .admin-search-bar {
      margin-bottom: 1.5rem;
      position: relative;
    }
    
    .admin-search-bar input {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-left: 2.5rem;
      background-color: var(--admin-dark-blue-700);
      border: 1px solid var(--admin-dark-blue-600);
      border-radius: 0.5rem;
      color: white;
      font-size: 0.875rem;
    }
    
    .admin-search-bar input:focus {
      outline: none;
      border-color: var(--admin-blue-500);
      box-shadow: 0 0 0 1px var(--admin-blue-500);
    }
    
    .admin-search-bar svg {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--admin-gray-400);
      width: 1rem;
      height: 1rem;
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Header Icons Styles */
    .easy-adminpanel-header-icons {
      display: flex;
      gap: 1rem;
      margin-right: 1rem;
    }
    
    .easy-adminpanel-header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      color: var(--admin-gray-300);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .easy-adminpanel-header-icon:hover {
      background-color: var(--admin-dark-blue-700);
      color: white;
      transform: translateY(-1px);
    }
    
    .easy-adminpanel-header-icon.active {
      background-color: var(--admin-blue-500);
      color: white;
    }
    `;

    // Create a promise that resolves when the font is loaded
    const fontPromise = new Promise<void>((fontResolve) => {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
      fontLink.onload = () => fontResolve();
      document.head.appendChild(fontLink);
    });

    // Create a promise that resolves when the styles are loaded
    const stylePromise = new Promise<void>((styleResolve) => {
      const style = document.createElement("style");
      style.id = "easy-adminpanel-styles";
      style.innerHTML = cssContent;
      style.onload = () => styleResolve();
      document.head.appendChild(style);
    });

    // Wait for both font and styles to load
    Promise.all([fontPromise, stylePromise]).then(() => {
      setTimeout(() => {
        resolve();
      }, 100); // Small delay to ensure CSS is applied
    });
  });
};

// Icons for the admin panel
const DatabaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const TableIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 3h18v18H3zM3 9h18M9 21V9"></path>
  </svg>
);

const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// Add more icons for sidebar menu
const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>
);

const GridIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

// Add a search icon component
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Add a close icon component
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Add Edit and Delete icon components
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 mr-2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 mr-2"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// New icon components for header
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Main AdminPanel component
interface AdminPanelProps {
  /**
   * Connection string
   */
  connectionString?: string;

  /**
   * Database type (if can't be detected automatically)
   */
  databaseType?: "postgresql" | "mysql" | "mssql";

  /**
   * Panel title
   */
  title?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  connectionString,
  databaseType,
  title = "Easy-AdminPanel",
}) => {
  // Define state for tables list
  const [tables, setTables] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Add state for loading screen
  const [cssLoaded, setCssLoaded] = React.useState(false);
  // Add state for database connection info
  const [dbInfo, setDbInfo] = React.useState({
    host: "",
    database: "",
    user: "",
    connected: false,
    type: databaseType || "postgresql",
  });

  // Add a state to track current active view
  const [activeView, setActiveView] = React.useState("grid");

  // Load tables when the page loads
  useEffect(() => {
    async function initialize() {
      // Add loading screen
      const loadingScreen = document.createElement("div");
      loadingScreen.className = "easy-adminpanel-loading";
      loadingScreen.innerHTML = `
        <div class="easy-adminpanel-loading-spinner"></div>
        <div class="easy-adminpanel-loading-text">Loading Easy-AdminPanel...</div>
      `;
      document.body.appendChild(loadingScreen);

      // Inject styles and wait for them to load
      await injectStylesheet();

      // Get database connection info
      fetchDatabaseInfo();

      // Load tables
      await loadTables();

      // Mark CSS as loaded and remove loading screen after a small delay
      setCssLoaded(true);
      setTimeout(() => {
        loadingScreen.classList.add("loaded");
        setTimeout(() => {
          if (document.body.contains(loadingScreen)) {
            document.body.removeChild(loadingScreen);
          }
        }, 500); // Remove loading screen after fade-out animation
      }, 300); // Small delay to ensure smooth transition
    }

    initialize();
  }, []);

  // Function to get database connection info
  const fetchDatabaseInfo = () => {
    // We'll extract info from environment variable or try to detect it
    const connectionUrl = connectionString || process.env.POSTGRES_URL || "";

    try {
      if (connectionUrl) {
        // For PostgreSQL URLs like: postgres://user:password@host:port/database
        const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        const match = connectionUrl.match(regex);

        if (match) {
          setDbInfo({
            user: match[1],
            host: match[3],
            database: match[5],
            connected: true,
            type: "postgresql",
          });
        } else {
          // If we can't parse, at least show we're connected
          setDbInfo((prev) => ({ ...prev, connected: true }));
        }
      } else {
        // If we don't have a connection string but the app is running,
        // assume we're connected through environment variables
        setDbInfo((prev) => ({ ...prev, connected: true }));
      }
    } catch (error) {
      console.error("Error parsing connection info:", error);
      // Still mark as connected since the app is running
      setDbInfo((prev) => ({ ...prev, connected: true }));
    }
  };

  // Function to load tables
  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();

      if (data.tables && Array.isArray(data.tables)) {
        setTables(data.tables);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error("Error loading tables:", error);
      setTables([]);
    }
    setLoading(false);
    return Promise.resolve();
  };

  // Updated Action when Manage Tables button is clicked
  const handleManageTables = () => {
    // Make API request
    fetch("/api/all-tables")
      .then((response) => response.json())
      .then((data) => {
        if (data.tables) {
          // Get currently selected tables
          fetch("/api/tables")
            .then((res) => res.json())
            .then((currentData) => {
              // Create enhanced modal for managing tables with improved UI
              const modalBackdrop = document.createElement("div");
              modalBackdrop.className = "admin-modal-backdrop";
              document.body.appendChild(modalBackdrop);

              // Create improved modal content
              const modal = document.createElement("div");
              modal.className = "admin-modal";
              modal.innerHTML = `
                <div class="admin-modal-header">
                  <h2 class="admin-modal-title">Select Database Tables</h2>
                  <button id="close-btn" class="admin-modal-close" aria-label="Close dialog">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div class="admin-modal-body">
                  <p class="text-admin-gray-400 mb-6">
                    Select the tables from your database that you want to manage through the admin panel.
                  </p>
                  
                  <div class="admin-search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" id="table-search" placeholder="Search tables..." autocomplete="off">
                  </div>
                  
                  <div id="table-list" class="space-y-2 mt-4"></div>
                </div>
                <div class="admin-modal-footer">
                  <button id="cancel-btn" class="easy-adminpanel-button easy-adminpanel-button-secondary">
                    Cancel
                  </button>
                  <button id="save-btn" class="easy-adminpanel-button easy-adminpanel-button-primary">
                    Save Changes
                  </button>
                </div>
              `;
              modalBackdrop.appendChild(modal);

              // Get the selected tables from current data
              const selectedTables = currentData.tables || [];

              // Create enhanced table list with search functionality
              const tableList = modal.querySelector("#table-list");
              const tableSearch = modal.querySelector("#table-search");
              const allTableItems: HTMLElement[] = [];

              if (tableList && tableSearch) {
                data.tables.forEach((tableName: string) => {
                  const isSelected = selectedTables.some(
                    (t: any) => t.name === tableName || t === tableName
                  );

                  const tableItem = document.createElement("div");
                  tableItem.className = "admin-table-select";
                  tableItem.dataset.tableName = tableName.toLowerCase();
                  tableItem.innerHTML = `
                    <label>
                      <input
                        type="checkbox"
                        data-table="${tableName}"
                        ${isSelected ? "checked" : ""}
                      />
                      <span class="admin-table-select-checkbox"></span>
                      <div>
                        <div class="admin-table-select-name">${tableName}</div>
                        <div class="admin-table-select-description">Table from database</div>
                      </div>
                    </label>
                  `;
                  tableList.appendChild(tableItem);
                  allTableItems.push(tableItem);
                });

                // Implement search functionality
                tableSearch.addEventListener("input", (e: any) => {
                  const searchTerm = e.target.value.toLowerCase();
                  allTableItems.forEach((item: HTMLElement) => {
                    const tableName = item.dataset.tableName;
                    if (tableName && tableName.includes(searchTerm)) {
                      item.style.display = "";
                    } else {
                      item.style.display = "none";
                    }
                  });
                });
              }

              // Add modal interactions
              // Close button
              const closeBtn = modal.querySelector("#close-btn");
              if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                  document.body.removeChild(modalBackdrop);
                });
              }

              // Cancel button
              const cancelBtn = modal.querySelector("#cancel-btn");
              if (cancelBtn) {
                cancelBtn.addEventListener("click", () => {
                  document.body.removeChild(modalBackdrop);
                });
              }

              // Close on backdrop click
              modalBackdrop.addEventListener("click", (e) => {
                if (e.target === modalBackdrop) {
                  document.body.removeChild(modalBackdrop);
                }
              });

              // Save button
              const saveBtn = modal.querySelector("#save-btn");
              if (saveBtn) {
                saveBtn.addEventListener("click", () => {
                  // Show loading state
                  saveBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  `;
                  // Fix: Cast to HTMLButtonElement to use disabled property
                  (saveBtn as HTMLButtonElement).disabled = true;

                  // Collect selected tables
                  const checkboxes = modal.querySelectorAll(
                    'input[type="checkbox"]'
                  );
                  const selectedTables = Array.from(checkboxes)
                    .filter((cb: any) => cb.checked)
                    .map((cb: any) => ({
                      name: cb.dataset.table,
                      displayName: cb.dataset.table,
                    }));

                  // Save tables
                  fetch("/api/save-tables", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ tables: selectedTables }),
                  })
                    .then(() => {
                      document.body.removeChild(modalBackdrop);
                      // Reload tables instead of refreshing page
                      loadTables();
                    })
                    .catch((error) => {
                      console.error("Error saving tables:", error);
                      saveBtn.innerHTML = "Save Changes";
                      // Fix: Cast to HTMLButtonElement to use disabled property
                      (saveBtn as HTMLButtonElement).disabled = false;
                    });
                });
              }
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching tables:", error);
      });
  };

  // List records for a table
  const handleListTable = (tableName: string) => {
    window.location.href = `/easy-adminpanel/records?table=${tableName}`;
  };

  // Add new record to table
  const handleAddRecord = (tableName: string) => {
    window.location.href = `/easy-adminpanel/add-record?table=${tableName}`;
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render the component
  return (
    <div
      className={`easy-adminpanel w-full min-h-screen flex ${
        !cssLoaded ? "loading" : ""
      }`}
    >
      {/* Enhanced Sidebar with better organization */}
      <div
        className={`easy-adminpanel-sidebar transition-all duration-300 ease-in-out ${
          !sidebarOpen ? "w-0 opacity-0" : "w-64 opacity-100"
        }`}
        style={{
          overflow: sidebarOpen ? "visible" : "hidden",
          visibility: sidebarOpen ? "visible" : "hidden",
          boxShadow: sidebarOpen ? "2px 0 8px rgba(0, 0, 0, 0.15)" : "none",
          paddingTop: "4.5rem" /* Add padding to account for fixed header */,
        }}
      >
        <div className="easy-adminpanel-sidebar-header">
          <div className="easy-adminpanel-sidebar-logo">
            <DatabaseIcon />
            <span>{title}</span>
          </div>
        </div>

        <div className="easy-adminpanel-sidebar-nav">
          {/* Main Menu Section */}
          <div className="easy-adminpanel-sidebar-section">
            <h3 className="easy-adminpanel-sidebar-section-title">Menu</h3>
            <div
              className="easy-adminpanel-sidebar-nav-item active"
              onClick={() => (window.location.href = "/easy-adminpanel")}
            >
              <DatabaseIcon />
              <span>Database Tables</span>
            </div>
            <div
              className="easy-adminpanel-sidebar-nav-item"
              onClick={() => setActiveView("grid")}
            >
              <GridIcon />
              <span>Card View</span>
            </div>
          </div>

          {/* Tables Section */}
          {tables.length > 0 && (
            <div className="easy-adminpanel-sidebar-section">
              <h3 className="easy-adminpanel-sidebar-section-title">Tables</h3>
              {tables.map((table: any) => (
                <div
                  key={table.name}
                  className="easy-adminpanel-sidebar-nav-item"
                  onClick={() => handleListTable(table.name)}
                >
                  <TableIcon />
                  <span>{table.displayName || table.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-admin-dark-blue-700 text-admin-gray-400 text-xs">
          <p>Easy AdminPanel v3.3.0</p>
        </div>
      </div>

      <div className="easy-adminpanel-main flex-1 transition-all duration-300">
        {/* Fixed Header */}
        <header className="easy-adminpanel-header">
          <div className="admin-container">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded hover:bg-admin-dark-blue-700 transition-colors duration-200"
                  aria-label="Toggle sidebar"
                  title="Toggle sidebar"
                >
                  {sidebarOpen ? (
                    // Arrow left icon when sidebar is open
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  ) : (
                    // Hamburger menu icon when sidebar is closed
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  )}
                </button>
                <div className="flex items-center">
                  <DatabaseIcon />
                  <h1 className="easy-adminpanel-title mb-0 ml-2">{title}</h1>
                </div>
              </div>

              {/* Header Icons */}
              <div className="flex items-center">
                <div className="easy-adminpanel-header-icons">
                  <div
                    className="easy-adminpanel-header-icon"
                    onClick={() => (window.location.href = "/easy-adminpanel")}
                    title="Admin Home"
                  >
                    <HomeIcon />
                  </div>
                  <div className="easy-adminpanel-header-icon" title="Settings">
                    <SettingsIcon />
                  </div>
                  <div
                    className="easy-adminpanel-header-icon"
                    title="User Profile"
                  >
                    <UserIcon />
                  </div>
                </div>

                {/* Enhanced database connection status indicator */}
                <div className="relative group">
                  <div
                    className={`admin-status-indicator ${
                      dbInfo.connected
                        ? "admin-status-online"
                        : "admin-status-offline"
                    } cursor-help`}
                  >
                    <span className="admin-status-indicator-dot"></span>
                    <span>{dbInfo.connected ? "Bağlı" : "Bağlantı Yok"}</span>
                  </div>

                  {/* Tooltip with database details */}
                  <div className="absolute right-0 top-full mt-2 w-64 bg-admin-dark-blue-800 border border-admin-dark-blue-600 rounded-md shadow-lg p-3 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <h4 className="font-semibold text-white mb-2 border-b border-admin-dark-blue-600 pb-1">
                      Database Connection
                    </h4>
                    <div className="space-y-1 text-admin-gray-300">
                      <div>
                        <span className="text-admin-gray-400">Type:</span>{" "}
                        {dbInfo.type}
                      </div>
                      {dbInfo.host && (
                        <div>
                          <span className="text-admin-gray-400">Host:</span>{" "}
                          {dbInfo.host}
                        </div>
                      )}
                      {dbInfo.database && (
                        <div>
                          <span className="text-admin-gray-400">Database:</span>{" "}
                          {dbInfo.database}
                        </div>
                      )}
                      {dbInfo.user && (
                        <div>
                          <span className="text-admin-gray-400">User:</span>{" "}
                          {dbInfo.user}
                        </div>
                      )}
                      <div>
                        <span className="text-admin-gray-400">Status:</span>{" "}
                        {dbInfo.connected ? "Connected" : "Disconnected"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-container py-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="easy-adminpanel-subtitle">Database Tables</h2>
            <button
              className="easy-adminpanel-button easy-adminpanel-button-primary"
              onClick={handleManageTables}
            >
              <TableIcon />
              Manage Tables
            </button>
          </div>

          {loading ? (
            <div className="easy-adminpanel-card p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-blue-500"></div>
            </div>
          ) : tables.length === 0 ? (
            <div className="easy-adminpanel-card">
              <div className="p-4 flex flex-col items-center justify-center text-center">
                <div className="mb-4 text-admin-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-12 h-12 mb-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-admin-gray-400 text-lg mb-4">
                    No tables have been selected yet
                  </p>
                  <p className="text-admin-gray-500 mb-6">
                    Use the "Manage Tables" button to select tables for data
                    management
                  </p>
                </div>
                <button
                  className="easy-adminpanel-button easy-adminpanel-button-primary"
                  onClick={handleManageTables}
                >
                  <TableIcon />
                  Select Tables
                </button>
              </div>
            </div>
          ) : (
            <div className="easy-adminpanel-grid">
              {tables.map((table: any) => (
                <div key={table.name} className="easy-adminpanel-card">
                  <h3 className="easy-adminpanel-card-title">
                    <TableIcon />
                    {table.displayName || table.name}
                  </h3>
                  <p className="text-admin-gray-400 text-sm mb-4">
                    {table.name}
                  </p>
                  <div className="flex space-x-2 mt-4">
                    <button
                      className="flex-1 easy-adminpanel-button easy-adminpanel-button-primary"
                      onClick={() => handleListTable(table.name)}
                    >
                      <ListIcon />
                      List
                    </button>
                    <button
                      className="flex-1 easy-adminpanel-button bg-green-600 hover:bg-green-500 text-white"
                      onClick={() => handleAddRecord(table.name)}
                    >
                      <PlusIcon />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default export
export default AdminPanel;
