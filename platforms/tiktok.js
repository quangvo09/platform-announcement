import fetcher from "../utils/fetcher.js";
const API_URL = "https://partner.tiktokshop.com/api/v1/document/tree?workspace_id=3&aid=359713&locale=en-US";

export const scrape = async () => {
  try {
    const resp = await fetcher(API_URL);
    const data = JSON.parse(resp);
    const documents = data.data?.document_tree || [];
    const tree = buildTree(documents);
    const changelogNode = tree.find((node) => node.name == "Changelog");
    const announcements = getLeaves(changelogNode)
      .sort((d1, d2) => +d1.update_time - +d2.update_time)
      .map((d) => ({
        id: d.document_id,
        platform: "tiktok",
        title: d.name,
        url: `https://partner.tiktokshop.com/docv2/page/${d.document_id}`,
      }));
    return announcements;
  } catch (error) {
    console.warn(error);
    return [];
  }
};

const getLeaves = (node) => {
  if (node.is_dir === 1 && !!node.children) {
    let leaves = [];
    node.children.forEach((n) => {
      leaves = leaves.concat(getLeaves(n));
    });
    return leaves;
  }

  if (node.is_dir === 1) {
    return [];
  }

  return [node];
};

const buildTree = (documents, parentId = "") => {
  return documents
    .filter((doc) => doc.parent_id == parentId)
    .map((doc) => ({
      ...doc,
      children: buildTree(documents, doc.document_id),
    }));
};
