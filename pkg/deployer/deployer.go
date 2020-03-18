package deployer

import (
	"fmt"
	"octopipe/pkg/execution"
	"octopipe/pkg/pipeline"
	"octopipe/pkg/utils"
	"strings"
	"sync"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
)

type Deployer struct {
	k8sDynamicClient dynamic.Interface
}

type UseCases interface {
	GetManifestsByHelmChart(pipeline *pipeline.Pipeline, component *pipeline.Version) (map[string]interface{}, error)
	Deploy(manifest map[string]interface{}, forceUpdate bool, executionLog func(string), waitingGroup *sync.WaitGroup) error
}

func NewDeployer(k8sDynamicClient dynamic.Interface) *Deployer {
	return &Deployer{k8sDynamicClient}
}

func (deployer *Deployer) GetManifestsByHelmChart(pipeline *pipeline.Pipeline, component *pipeline.Version) (map[string]interface{}, error) {
	encodedManifests := map[string]interface{}{}
	chart, values, err := deployer.getHelmChartAndValues(pipeline, component)
	if err != nil {
		return nil, err
	}

	manifests, err := deployer.renderManifest(chart, values)
	if err != nil {
		return nil, err
	}

	for key, manifest := range manifests {
		if manifest != "" {
			encodedManifest, err := deployer.encodeStringManifest(manifest)
			if err != nil {
				return nil, err
			}
			encodedManifests[key] = encodedManifest
		}
	}

	return encodedManifests, nil
}

func (deployer *Deployer) Deploy(
	manifest map[string]interface{}, forceUpdate bool, executionLog func(string), waitingGroup *sync.WaitGroup,
) error {
	defer waitingGroup.Done()
	var err error

	unstruct := &unstructured.Unstructured{
		Object: manifest,
	}
	schema := deployer.getResourceSchema(unstruct)

	_, err = deployer.k8sDynamicClient.Resource(schema).Namespace(unstruct.GetNamespace()).Create(unstruct, metav1.CreateOptions{})
	if err != nil && strings.Contains(err.Error(), "already exists") {
		if forceUpdate {
			item, _ := deployer.k8sDynamicClient.Resource(schema).Namespace(unstruct.GetNamespace()).Get(unstruct.GetName(), metav1.GetOptions{})
			unstruct.SetResourceVersion(item.GetResourceVersion())
			_, err = deployer.k8sDynamicClient.Resource(schema).Namespace(unstruct.GetNamespace()).Update(unstruct, metav1.UpdateOptions{})
		} else {
			executionLog(execution.ManifestExist)
			utils.CustomLog("error", "Deploy", err.Error())
			return nil
		}
	}

	if err != nil {
		executionLog(execution.ManifestExist)
		utils.CustomLog("error", "Deploy", err.Error())
		return err
	}

	executionLog(execution.ManifestDeployed)
	return nil
}

func (deployer *Deployer) getResourceSchema(k8sObject *unstructured.Unstructured) schema.GroupVersionResource {
	group := k8sObject.GroupVersionKind().Group
	version := k8sObject.GroupVersionKind().Version
	resource := fmt.Sprintf("%ss", strings.ToLower(k8sObject.GroupVersionKind().Kind))
	return schema.GroupVersionResource{Group: group, Version: version, Resource: resource}
}
