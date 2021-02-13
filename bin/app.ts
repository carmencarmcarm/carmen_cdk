#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Infrastructure } from '../lib';

const app = new cdk.App();
new Infrastructure(app, 'WebsiteStack');
