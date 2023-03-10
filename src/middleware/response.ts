import { Request, Response } from 'express';
import xml from 'xml';
import _ from 'lodash';
import log from '@/logger';

type Node =
  | {
      type: string;
      attrs: { [key: string]: any };
      children: Node[];
    }
  | string;

function getXmlNodeInfo(o: any) {
  const attrs: any = {};
  const children: Node[] = [];

  Object.entries(o).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      val.forEach((v) => {
        children.push({
          type: key,
          ...getXmlNodeInfo(v),
        });
      });
    } else if (
      typeof val === 'object' &&
      !(val instanceof Date) &&
      val !== null
    ) {
      children.push({
        type: key,
        ...getXmlNodeInfo(val),
      });
    } else if (key === 'value') {
      children.push(String(val));
    } else {
      if (val instanceof Date) {
        attrs[key] = val.toISOString();
      } else if (val !== undefined && val !== null) {
        attrs[key] = val;
      }
    }
  });

  return {
    attrs,
    children,
  };
}

function toXmlNode(node: Node): xml.XmlObject {
  if (typeof node === 'object')
    return {
      [node.type]: [
        { _attr: node.attrs },
        ...(node.children.length ? node.children.map(toXmlNode) : ['']),
      ],
    };
  return node;
}

function toXml(o: any) {
  const xmlStructure = getXmlNodeInfo(o);
  return xmlStructure.children.map(toXmlNode);
}

export default function successMiddleware(req: Request, res: Response): void {
  const data = res.locals || {};
  const isJson = req.query.f === 'json';

  if (Object.keys(data).length === 1 && data.empty) delete data.empty;

  const response = {
    'subsonic-response': {
      version: '1.13.0',
      status: data.error ? 'failed' : 'ok',
      ...data,
      xmlns: isJson ? undefined : 'http://subsonic.org/restapi',
    },
  };

  if (data.error) {
    log('ERROR', data.error.message);
  }

  if (isJson) {
    res.json(response);
  } else {
    res.set('Content-Type', 'text/xml');
    res.send(
      xml(toXml(response), {
        declaration: true,
        indent: ' ',
      })
    );
  }
}
